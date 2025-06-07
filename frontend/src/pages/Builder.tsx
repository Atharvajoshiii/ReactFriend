import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';

import { Loader } from '../components/Loader';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    // Build the file tree from all CreateFile steps
    const buildFileTree = (steps: Step[]): FileItem[] => {
      const root: FileItem[] = [];
      for (const step of steps) {
        if (step.type === StepType.CreateFile && step.path) {
          let parsedPath = step.path.split("/");
          let current = root;
          let currentFolder = "";
          while (parsedPath.length) {
            const currentFolderName = parsedPath[0];
            currentFolder = `${currentFolder}/${currentFolderName}`;
            parsedPath = parsedPath.slice(1);
            if (!parsedPath.length) {
              // Final file
              let file = current.find(x => x.path === currentFolder);
              if (!file) {
                current.push({
                  name: currentFolderName,
                  type: 'file',
                  path: currentFolder,
                  content: step.code
                });
              } else {
                file.content = step.code;
              }
            } else {
              // Folder
              let folder = current.find(x => x.path === currentFolder);
              if (!folder) {
                folder = {
                  name: currentFolderName,
                  type: 'folder',
                  path: currentFolder,
                  children: []
                };
                current.push(folder);
              }
              current = folder.children!;
            }
          }
        }
      }
      return root;
    };
    const newFiles = buildFileTree(steps);
    setFiles(newFiles);
  }, [steps]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    
    const {prompts, uiPrompts} = response.data;

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    init();
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="bg-black border-b border-zinc-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-white">Website Builder</h1>
        <p className="text-sm text-zinc-300 mt-1 font-light">Prompt: {prompt}</p>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-4 p-4">
          <div className="col-span-1 space-y-4 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll border border-zinc-800 rounded-lg bg-black">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div className="mt-4">
                <div className='w-full'>
                  <br />
                  {(loading || !templateSet) && <div className="flex justify-center"><Loader /></div>}
                  {!(loading || !templateSet) && <div className='flex flex-col space-y-2'>
                    <textarea 
                      value={userPrompt} 
                      onChange={(e) => setPrompt(e.target.value)} 
                      className='p-3 w-full border border-zinc-700 rounded-md bg-black text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all'
                      placeholder="Type your prompt here..."
                      rows={3}
                    />
                    <button 
                      onClick={async () => {
                        const newMessage = {
                          role: "user" as "user",
                          content: userPrompt
                        };

                        setLoading(true);
                        const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                          messages: [...llmMessages, newMessage]
                        });
                        setLoading(false);

                        setLlmMessages(x => [...x, newMessage]);
                        setLlmMessages(x => [...x, {
                          role: "assistant",
                          content: stepsResponse.data.response
                        }]);
                        
                        setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                          ...x,
                          status: "pending" as "pending"
                        }))]);
                        
                        // Clear the prompt after sending
                        setPrompt("");
                      }} 
                      className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600'
                    >
                      Send
                    </button>
                  </div>}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="border border-zinc-800 rounded-lg bg-black h-full overflow-auto">
              <div className="p-3 border-b border-zinc-800">
                <h2 className="text-sm font-medium text-white">Files</h2>
              </div>
              <FileExplorer 
                files={files} 
                onFileSelect={setSelectedFile}
              />
            </div>
          </div>
          <div className="col-span-2 bg-black border border-zinc-800 rounded-lg shadow-sm h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-3rem)] border-t border-zinc-800">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                webcontainer && <PreviewFrame webContainer={webcontainer} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}