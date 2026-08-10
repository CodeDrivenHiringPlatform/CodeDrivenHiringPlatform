import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trophy } from "lucide-react"
import Navbar from "@/components/Navbar"
import { getLeaderboardData } from "@/services/candidate" 
import { toast } from "sonner"

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseData = await getLeaderboardData()

        if (responseData?.success || responseData?.status) {
          const rawData = responseData.data || []

          const formatted = [...rawData]
            .sort((a, b) => {
              const scoreA = a.totalScore ?? a.total_score ?? 0
              const scoreB = b.totalScore ?? b.total_score ?? 0
              return scoreB - scoreA
            })
            .map((user, index) => {
              const scoreVal = user.totalScore ?? user.total_score ?? 0
              const userIdVal = user.userId ?? user.user_id ?? index

              return {
                id: userIdVal,
                name: user.name || "Anonymous",
                score: typeof scoreVal === "number" ? scoreVal : 0,
                rank: index + 1,
                avatar: user.profilePic || "",
              }
            })

          setLeaderboardData(formatted)
        }
      } catch (err) {
        toast.error("Failed to fetch leaderboard: " + (err.message || err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Navbar />
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Loading leaderboard data...
                  </TableCell>
                </TableRow>
              ) : leaderboardData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No leaderboard data available.
                  </TableCell>
                </TableRow>
              ) : (
                leaderboardData.map((user) => (
                  <TableRow key={user.id} className="group transition-colors">
                    <TableCell className="text-center font-bold">
                      <span
                        className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm
                        ${user.rank === 1 ? "bg-yellow-500/20 text-yellow-600" : ""}
                        ${user.rank === 2 ? "bg-slate-300/30 text-slate-500" : ""}
                        ${user.rank === 3 ? "bg-orange-400/20 text-orange-600" : ""}
                        ${user.rank > 3 ? "text-muted-foreground" : ""}
                      `}
                      >
                        {user.rank}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono font-semibold">
                      {(user.score ?? 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/candidate/profile/${user.id}`}>
                          <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span className="sr-only">View profile</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}