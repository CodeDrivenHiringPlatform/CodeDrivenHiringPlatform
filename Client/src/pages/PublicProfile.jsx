import React, { useEffect, useState } from "react"
import { useParams } from "react-router"
import { getPublicProfile } from "@/services/candidate"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// ─── Skill level config ───────────────────────────────────────────────────────
const SKILL_LEVEL_VARIANT = {
  BEGINNER:     "outline",
  INTERMEDIATE: "secondary",
  ADVANCED:     "default",
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const Icon = {
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Trophy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
      <path d="M12 2a5 5 0 0 0-5 5v3.5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/>
    </svg>
  ),
  Github: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  ),
  Linkedin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  GraduationCap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
}

// ─── Small reusable section card ─────────────────────────────────────────────
function SectionCard({ icon, title, description, children }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ text }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getPublicProfile(id)
        if (response.status) {
          console.log(response.data)
          setProfile(response.data)
        } else {
          toast.error(response.message || "Failed to load profile")
        }
      } catch {
        toast.error("Something went wrong. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground animate-pulse">Loading profile…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || `U${profile.userId}`

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">

      {/* ── Hero ── */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-card rounded-xl border shadow-sm">
        <Avatar className="h-24 w-24 shrink-0 border-2 border-background shadow-md ring-1 ring-border">
          <AvatarImage src={profile.profilePic || ""} alt={profile.name || "User"} />
          <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.name ?? `User #${profile.userId}`}
          </h1>

          {profile.bio && (
            <p className="text-sm text-muted-foreground max-w-lg">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon.MapPin /> India
            </span>

            {profile.email && (
              <span className="flex items-center gap-1">
                <Icon.Mail /> {profile.email}
              </span>
            )}

            {profile.total_score !== undefined && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Icon.Trophy /> Score: {profile.total_score}
              </span>
            )}

            {profile.links?.github && (
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Icon.Github /> GitHub
              </a>
            )}

            {profile.links?.linkedin && (
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Icon.Linkedin /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Social / resume actions */}
        <div className="flex items-center gap-2 shrink-0">
          {profile.resumeUrl && (
            <Button size="sm" asChild>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                Resume
              </a>
            </Button>
          )}
          {profile.links?.github && (
            <Button variant="outline" size="icon" asChild>
              <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <Icon.Github />
              </a>
            </Button>
          )}
          {profile.links?.linkedin && (
            <Button variant="outline" size="icon" asChild>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Icon.Linkedin />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* ── Body grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Left sidebar ── */}
        <div className="space-y-5">

          {/* Skills */}
          <SectionCard title="Skills">
            {profile.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <div key={skill.name} className="flex flex-col items-start gap-0.5">
                    <Badge variant={SKILL_LEVEL_VARIANT[skill.level] ?? "outline"}>
                      {skill.name}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No skills added yet." />
            )}
          </SectionCard>

          {/* Education */}
          <SectionCard icon={<Icon.GraduationCap />} title="Education">
            {profile.education?.length ? (
              <div className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-medium text-sm leading-tight">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Icon.Calendar />
                      {edu.startYear} – {edu.endYear ?? "Present"}
                    </p>
                    {i < profile.education.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No education added." />
            )}
          </SectionCard>

          {/* Certificates */}
          <SectionCard icon={<Icon.Award />} title="Certificates">
            {profile.certificates?.length ? (
              <div className="space-y-3">
                {profile.certificates.map((cert, i) => (
                  <div key={i}>
                    <p className="font-medium text-sm">{cert.title}</p>
                    {cert.issuer && (
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                    )}
                    {cert.year && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Icon.Calendar /> {cert.year}
                      </p>
                    )}
                    {i < profile.certificates.length - 1 && <Separator className="mt-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No certificates added." />
            )}
          </SectionCard>
        </div>

        {/* ── Right main ── */}
        <div className="md:col-span-2 space-y-5">

          {/* Experience */}
          <SectionCard
            icon={<Icon.Briefcase />}
            title="Experience"
            description="Work history"
          >
            {profile.experience?.length ? (
              <div className="space-y-5">
                {profile.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{exp.role}</p>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Icon.Calendar />
                        {exp.startDate} – {exp.endDate ?? "Present"}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                    )}
                    {i < profile.experience.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No experience added yet." />
            )}
          </SectionCard>

          {/* Projects */}
          <SectionCard
            title="Projects"
            description="Personal & professional work"
          >
            {profile.projects?.length ? (
              <div className="space-y-5">
                {profile.projects.map((project, i) => (
                  <div key={project.title ?? i}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{project.title}</p>
                        {project.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.techStack.map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs px-1.5 py-0">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1.5">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {project.link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 gap-1 text-xs"
                          asChild
                        >
                          <a href={project.link} target="_blank" rel="noreferrer">
                            View <Icon.ExternalLink />
                          </a>
                        </Button>
                      )}
                    </div>

                    {i < profile.projects.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No projects added yet." />
            )}
          </SectionCard>

        </div>
      </div>
    </div>
  )
}