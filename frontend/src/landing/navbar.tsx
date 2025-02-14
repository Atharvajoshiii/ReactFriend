import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Services', url: '#', icon: User },
    { name: 'Pricing', url: '#', icon: Briefcase },
    { name: 'Contact', url: '#', icon: FileText }
  ]

  return <NavBar items={navItems} />
}