import { Menu, User, LogOut, FileCode, Code } from "lucide-react" // Added 'Code' icon
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDispatch, useSelector } from "react-redux"
import { logoutAction } from "@/store/slices/userSlice"

// 1. Define distinct links depending on user roles
const candidateLinks = [
  { name: "Home", href: "/" },
  { name: "Problems", href: "/problems" },
  { name: "Leaderboard", href: "/Leaderboard" },
  { name: "Contests", href: "/contests" }
]

const recruiterLinks = [
  { name: "Home", href: "/recruiter" },
  { name: "Leaderboard", href: "/Leaderboard" }
]

const adminLinks = [
  { name: "Home", href: "/admin" },
  { name: "Leaderboard", href: "/Leaderboard" }
]

export default function Navbar() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user) 

  const handleLogout = () => {
    dispatch(logoutAction())
    localStorage.clear();
  }

  // 2. Helper function to fetch the correct link configuration
  const getNavLinks = () => {
    if (!user) return candidateLinks // Default fallback for guests
    
    switch (user.role) {
      case "ROLE_RECRUITER":
        return recruiterLinks
      case "ROLE_ADMIN":
        return adminLinks
      case "ROLE_CANDIDATE":
      default:
        return candidateLinks
    }
  }

  const currentLinks = getNavLinks()
  const isCandidate = user?.role?.toUpperCase() === "ROLE_CANDIDATE"

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Code className="h-5 w-5" />
          </div>
          <span>Code Hire</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}

          {/* Profile Dropdown for Authenticated User */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 select-none">
                  <Avatar className="h-10 w-10 border border-muted">
                    <AvatarImage src={user.profilePic} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <span className="inline-flex w-fit items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-1">
                      {user.role?.slice(5)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                
                {isCandidate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/candidate/submissions" className="cursor-pointer w-full flex items-center">
                        <FileCode className="mr-2 h-4 w-4" />
                        <span>Submissions</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation (Sheet) */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 flex flex-col justify-between">
              
              <div className="flex flex-col gap-4 mt-16">
                {/* User Info Header in Mobile Side Drawer */}
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-muted ml-3">
                    <Avatar className="h-12 w-12 border border-muted">
                      <AvatarImage src={user.profilePic} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-semibold text-base truncate max-w-[180px]">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-4 mt-4 ml-6">
                  {currentLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Action Buttons at the bottom of the drawer */}
              <div className="pb-6 border-t border-muted pt-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    {isCandidate && (
                      <>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link to="/profile">
                            <User className="mr-2 h-4 w-4" /> My Profile
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link to="/candidate/submissions">
                            <FileCode className="mr-2 h-4 w-4" /> Submissions
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button onClick={handleLogout} variant="destructive" className="w-full justify-start">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/login">Login</Link>
                  </Button>
                )}
              </div>

            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}