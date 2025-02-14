import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { CheckCircle, Clock, Star, TrendingUp, Video, Globe } from "lucide-react";

const itemsSample: BentoItem[] = [
    {
        title: "Analytics Dashboard",
        meta: "v2.4.1",
        description: "Real-time metrics with AI-powered insights and predictive analytics",
        icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
        status: "Live",
        tags: ["Statistics", "Reports", "AI"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "Task Manager",
        meta: "84 completed",
        description: "Automated workflow management with priority scheduling",
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        status: "Updated",
        tags: ["Productivity", "Automation"],
    },
    {
        title: "Media Library",
        meta: "12GB used",
        description: "Cloud storage with intelligent content processing",
        icon: <Video className="w-5 h-5 text-purple-500" />,
        tags: ["Storage", "CDN"],
        colSpan: 2,
    },
    {
        title: "Global Network",
        meta: "6 regions",
        description: "Multi-region deployment with edge computing",
        icon: <Globe className="w-5 h-5 text-sky-500" />,
        status: "Beta",
        tags: ["Infrastructure", "Edge"],
    },
];

function BentoGridDemo() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] px-4 text-white">
            <h1 className="font-bold text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 ">
                Service We Provide You
            </h1>
            <div className="w-full max-w-6xl mt-8">
                <BentoGrid items={itemsSample} />
            </div>
        </div>
    );
}

export { BentoGridDemo };
