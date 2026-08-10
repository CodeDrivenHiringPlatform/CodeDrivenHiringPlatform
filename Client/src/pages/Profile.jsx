import React, { useEffect, useState, useRef } from "react"
// import { useNavigate } from "react-router";
import { User, Briefcase, GraduationCap, Award, Globe, ShieldAlert, Save, Plus, Trash2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getcandidateProfile,
  updateCandidateProfile,
  analyzeCandidateProfile
} from "@/services/user"
import { toast } from "sonner"

const EMPTY_PROFILE = {
  name: "", email: "", profilePic: null, total_score: 0, bio: "",
  skills: [], education: [], experience: [], projects: [],
  links: { github: "", linkedin: "" }
}

export default function Profile() {

  // const navigate = useNavigate();

  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [analysis, setAnalysis] = useState("")
const [isAnalyzing, setIsAnalyzing] = useState(false)
const [openAnalysis, setOpenAnalysis] = useState(false);
  const fileRef = useRef(null)
  const picFileRef = useRef(null) // holds the actual File object for upload

  useEffect(() => {
    getcandidateProfile()
      .then(res => {
        const data = res?.data || res
        if (data) setProfile({ ...EMPTY_PROFILE, ...data, links: { ...EMPTY_PROFILE.links, ...data.links } })
      })
      .catch(err => console.error("Failed to load profile:", err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleLinkChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, links: { ...prev.links, [name]: value } }))
  }

  const handleArrayChange = (index, field, value, section) => {
    setProfile(prev => {
      const updated = [...prev[section]]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, [section]: updated }
    })
  }

  const addItem = (section, defaultObj) =>
    setProfile(prev => ({ ...prev, [section]: [...prev[section], defaultObj] }))

  const removeItem = (section, index) =>
    setProfile(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }))

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return toast.error("Please upload a valid image file.")
    if (file.size > 2 * 1024 * 1024) return toast.error("Image size must be less than 2MB.")

    picFileRef.current = file // store File object for FormData submission

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, profilePic: reader.result })) // preview only
      toast.success("Profile picture selected. Click Save to apply.")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile.name?.trim()) return toast.error("Full name is required.")
    setIsSaving(true)

    try {
      // Always use FormData so the file can be included when present
      const formData = new FormData()
      formData.append("name", profile.name)
      formData.append("bio", profile.bio || "")
      formData.append("skills", JSON.stringify(profile.skills))
      formData.append("education", JSON.stringify(profile.education))
      formData.append("experience", JSON.stringify(profile.experience))
      formData.append("projects", JSON.stringify(profile.projects))
      formData.append("links", JSON.stringify(profile.links))
      if (picFileRef.current) {
        formData.append("profilePic", picFileRef.current)
        picFileRef.current = null // clear after appending
      }

      const response = await updateCandidateProfile(formData)
      if (response.status) {
        toast.success("Profile updated successfully.")
      } else {
        toast.error("Failed to save profile.")
      }
    } catch (err) {
      toast.error("Error saving profile: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyzeProfile = async () => {

  try {

    setIsAnalyzing(true)

    const response = await analyzeCandidateProfile();

console.log("Full Response:", response);
console.log("Response Data:", response.data);
console.log("Analysis:", response.data?.analysis);
console.log("response.success =", response.success);
console.log(response);
if (response?.status) {

    setAnalysis(response.data.analysis);

    setOpenAnalysis(true);

    console.log("After setOpenAnalysis");

    toast.success(response.message);

} else {

    toast.error(response?.message || "Analysis failed.");

}

  } catch (err) {

    toast.error("Failed to analyze profile.")

  } finally {

    setIsAnalyzing(false)

  }
}
  const getInitials = (name) =>
    name ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "U"

  if (isLoading) {
    return (
    
      <div className="flex items-center justify-center min-h-[400px] w-full text-muted-foreground text-sm font-medium">
        Loading profile data...
      </div>
    )
    
  }
  console.log("openAnalysis =", openAnalysis);
  return (
    <div className="w-full px-4 py-6 md:p-8 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">

        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleProfilePicChange} />

        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div
              className="relative group cursor-pointer shrink-0 rounded-full"
              onClick={() => fileRef.current?.click()}
              title="Click to change profile image"
            >
              <Avatar className="h-20 w-20 border-2 border-primary/20 transition-opacity group-hover:opacity-80">
                <AvatarImage src={profile.profilePic} alt={profile.name} className="object-cover" />
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-1 w-full overflow-hidden">
              <h1 className="text-xl font-bold tracking-tight truncate">{profile.name || "Anonymous User"}</h1>
              <p className="text-muted-foreground text-sm truncate">{profile.email || "No email linked"}</p>
              <div className="pt-1 flex justify-center sm:justify-start">
                <Badge className="bg-emerald-600 hover:bg-emerald-700">Rating: {profile.total_score} Score</Badge>
              </div>
            </div>
          </div>

         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

  <Button
    type="button"
    variant="secondary"
    onClick={handleAnalyzeProfile}
    disabled={isAnalyzing}
    className="w-full sm:w-auto"
  >
    {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
  </Button>

  <button
    type="submit"
    disabled={isSaving}
    className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 shrink-0"
  >
    <Save className="h-4 w-4" />
    {isSaving ? "Saving..." : "Save Profile"}
  </button>

</div>
        </div>

        {/* Tabs Grid Optimization */}
        <Tabs defaultValue="general" className="w-full">
          <div className="w-full overflow-x-auto pb-1 scrollbar-none">
            <TabsList className="flex sm:grid sm:grid-cols-5 w-max sm:w-full h-auto p-1 bg-muted/60 rounded-lg gap-1 min-w-full">
              <TabsTrigger value="general" className="gap-2 py-2 text-xs md:text-sm whitespace-nowrap px-4 flex-1 justify-center"><User className="h-3.5 w-3.5" /> Account</TabsTrigger>
              <TabsTrigger value="skills" className="gap-2 py-2 text-xs md:text-sm whitespace-nowrap px-4 flex-1 justify-center"><Award className="h-3.5 w-3.5" /> Skills</TabsTrigger>
              <TabsTrigger value="experience" className="gap-2 py-2 text-xs md:text-sm whitespace-nowrap px-4 flex-1 justify-center"><Briefcase className="h-3.5 w-3.5" /> Experience</TabsTrigger>
              <TabsTrigger value="education" className="gap-2 py-2 text-xs md:text-sm whitespace-nowrap px-4 flex-1 justify-center"><GraduationCap className="h-3.5 w-3.5" /> Education</TabsTrigger>
              <TabsTrigger value="portfolio" className="gap-2 py-2 text-xs md:text-sm whitespace-nowrap px-4 flex-1 justify-center"><Globe className="h-3.5 w-3.5" /> Projects</TabsTrigger>
            </TabsList>
          </div>

          {/* ACCOUNT */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
                <CardDescription className="text-xs">Manage public display details and connected links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Full Name <span className="text-destructive">*</span></label>
                    <Input name="name" value={profile.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                      Email Address <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    </label>
                    <Input value={profile.email} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Bio Summary</label>
                  <Textarea name="bio" value={profile.bio} onChange={handleInputChange} rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">GitHub Profile URL</label>
                    <Input name="github" value={profile.links?.github} onChange={handleLinkChange} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">LinkedIn Profile URL</label>
                    <Input name="linkedin" value={profile.links?.linkedin} onChange={handleLinkChange} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SKILLS */}
          <TabsContent value="skills" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Core Capabilities</CardTitle>
                  <CardDescription className="text-xs hidden sm:block">Update and manage technical skill matrices.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addItem("skills", { name: "", level: "BEGINNER" })} className="gap-1 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add New
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {profile.skills.map((skill, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground sm:hidden">Skill Name <span className="text-destructive">*</span></label>
                      <Input placeholder="Skill Name" value={skill.name} onChange={(e) => handleArrayChange(idx, "name", e.target.value, "skills")} className="bg-background text-sm" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-initial space-y-1 sm:space-y-0">
                        <label className="text-[10px] font-medium text-muted-foreground sm:hidden">Skill Level <span className="text-destructive">*</span></label>
                        <Select value={skill.level || "BEGINNER"} onValueChange={(val) => handleArrayChange(idx, "level", val, "skills")}>
                          <SelectTrigger className="w-full sm:w-[160px] bg-background text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BEGINNER">BEGINNER</SelectItem>
                            <SelectItem value="INTERMEDIATE">INTERMEDIATE</SelectItem>
                            <SelectItem value="ADVANCED">ADVANCED</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem("skills", idx)} className="text-destructive hover:bg-destructive/10 shrink-0 mt-4 sm:mt-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPERIENCE */}
          <TabsContent value="experience" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Professional Experience</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => addItem("experience", { company: "", role: "", startDate: "", endDate: "", description: "" })} className="gap-1 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add Work
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/10 space-y-3 relative">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem("experience", idx)} className="absolute right-2 top-2 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 md:pt-0">
                      <div className="space-y-1"><label className="text-xs font-medium">Job Title <span className="text-destructive">*</span></label><Input value={exp.role} onChange={(e) => handleArrayChange(idx, "role", e.target.value, "experience")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">Company Name <span className="text-destructive">*</span></label><Input value={exp.company} onChange={(e) => handleArrayChange(idx, "company", e.target.value, "experience")} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="text-xs font-medium">Start Date (YYYY-MM) <span className="text-destructive">*</span></label><Input value={exp.startDate} onChange={(e) => handleArrayChange(idx, "startDate", e.target.value, "experience")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">End Date</label><Input value={exp.endDate} placeholder="Present" onChange={(e) => handleArrayChange(idx, "endDate", e.target.value, "experience")} /></div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Role Description <span className="text-destructive">*</span></label>
                      <Textarea value={exp.description} onChange={(e) => handleArrayChange(idx, "description", e.target.value, "experience")} rows={2} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EDUCATION */}
          <TabsContent value="education" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Academic History</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => addItem("education", { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "" })} className="gap-1 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/10 space-y-3 relative">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem("education", idx)} className="absolute right-2 top-2 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-6 md:pt-0">
                      <div className="space-y-1"><label className="text-xs font-medium">Institution Name <span className="text-destructive">*</span></label><Input value={edu.institution} onChange={(e) => handleArrayChange(idx, "institution", e.target.value, "education")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">Degree <span className="text-destructive">*</span></label><Input value={edu.degree} onChange={(e) => handleArrayChange(idx, "degree", e.target.value, "education")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">Field of Study <span className="text-destructive">*</span></label><Input value={edu.fieldOfStudy} onChange={(e) => handleArrayChange(idx, "fieldOfStudy", e.target.value, "education")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">Start Year <span className="text-destructive">*</span></label><Input type="number" value={edu.startYear} onChange={(e) => handleArrayChange(idx, "startYear", parseInt(e.target.value) || "", "education")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">End Year</label><Input type="number" value={edu.endYear} onChange={(e) => handleArrayChange(idx, "endYear", parseInt(e.target.value) || "", "education")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">Grade / CGPA</label><Input value={edu.grade} onChange={(e) => handleArrayChange(idx, "grade", e.target.value, "education")} /></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROJECTS */}
          <TabsContent value="portfolio" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Projects & Repositories</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => addItem("projects", { title: "", description: "", link: "" })} className="gap-1 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 border rounded-xl bg-background space-y-3 relative">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem("projects", idx)} className="absolute right-2 top-2 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 md:pt-0">
                      <div className="space-y-1"><label className="text-xs font-medium">Project Title <span className="text-destructive">*</span></label><Input value={proj.title} onChange={(e) => handleArrayChange(idx, "title", e.target.value, "projects")} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">Repository / App Link</label><Input value={proj.link} onChange={(e) => handleArrayChange(idx, "link", e.target.value, "projects")} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-medium">Description <span className="text-destructive">*</span></label><Textarea value={proj.description} onChange={(e) => handleArrayChange(idx, "description", e.target.value, "projects")} rows={2} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
               </Tabs>

      
      </form>
     <Sheet
  open={openAnalysis}
  onOpenChange={(value) => {
    console.log("Sheet changed:", value);
    setOpenAnalysis(value);
  }}
>
  <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
   <SheetHeader className="border-b pb-4">
  <SheetTitle className="flex items-center gap-2 text-xl font-bold">
    🤖 AI Profile Analysis
  </SheetTitle>

  <p className="text-sm text-gray-500">
    Here is your AI-generated profile review.
  </p>
</SheetHeader>

    <div className="mt-6 space-y-4">

  <div className="rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 p-5">
    <h2 className="text-lg font-bold">📄 AI Report</h2>
    <p className="text-sm text-gray-600 mt-1">
      The following analysis is generated by AI based on your current profile.
    </p>
  </div>



  {/* Overall Score */}

<div className="mt-6 space-y-6">

  {/* Overall Score */}

 <div className="rounded-2xl border bg-white shadow-md p-6">

  <div className="flex justify-between items-center">

    <div>

      <h2 className="text-xl font-bold">
        ⭐ Overall Score
      </h2>

      <p className="text-gray-500 text-sm mt-1">
        AI evaluation of your complete profile
      </p>

    </div>

    <div className="text-4xl font-extrabold text-purple-600">

      {analysis.overallScore}/100

    </div>

  </div>

  {/* Progress Bar */}

  <div className="mt-6 w-full bg-gray-200 rounded-full h-3">

  <div
  className={`${
    analysis.overallScore < 40
      ? "bg-red-500"
      : analysis.overallScore < 70
      ? "bg-orange-500"
      : "bg-green-500"
  } h-3 rounded-full transition-all duration-500`}
  style={{
    width: `${analysis.overallScore}%`,
  }}
/>

  </div>

<div
  className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1
  ${
    analysis.overallScore < 40
      ? "bg-red-100"
      : analysis.overallScore < 70
      ? "bg-orange-100"
      : "bg-green-100"
  }`}
>
  <div
    className={`h-2 w-2 rounded-full
    ${
      analysis.overallScore < 40
        ? "bg-red-500"
        : analysis.overallScore < 70
        ? "bg-orange-500"
        : "bg-green-500"
    }`}
  />

  <span
    className={`text-sm font-semibold
    ${
      analysis.overallScore < 40
        ? "text-red-700"
        : analysis.overallScore < 70
        ? "text-orange-700"
        : "text-green-700"
    }`}
  >
    {analysis.overallScore < 40
      ? "Poor Profile"
      : analysis.overallScore < 70
      ? "Needs Improvement"
      : "Excellent Profile"}
  </span>
</div>

</div>

  {/* Professional Summary */}

  <div className="rounded-xl border p-5 shadow-sm">
    <h2 className="text-lg font-bold mb-3">
      👤 Professional Summary
    </h2>

    <p className="text-gray-700 leading-7">
      {analysis.professionalSummary}
    </p>
  </div>

  {/* Strengths */}

 {/* Strengths */}

<div className="rounded-xl border p-5 shadow-sm">
  <h2 className="text-lg font-bold mb-4">
    💪 Strengths
  </h2>

  <ul className="space-y-3">
    {analysis.strengths?.map((item, index) => (
      <li
        key={index}
        className="bg-green-50 border border-green-200 rounded-lg p-3"
      >
        ✅ {item}
      </li>
    ))}
  </ul>

  </div>
{/* Weaknesses */}

<div className="rounded-xl border p-5 shadow-sm">
  <h2 className="text-lg font-bold mb-4">
    ⚠️ Weaknesses
  </h2>

  <ul className="space-y-3">
    {analysis.weaknesses?.map((item, index) => (
      <li
        key={index}
        className="bg-red-50 border border-red-200 rounded-lg p-3"
      >
        ❌ {item}
      </li>
    ))}
  </ul>
</div>
{/* Missing Skills */}

<div className="rounded-xl border p-5 shadow-sm">
  <h2 className="text-lg font-bold mb-4">
    📚 Missing Skills
  </h2>

  <div className="flex flex-wrap gap-2">
    {analysis.missingSkills?.map((skill, index) => (
      <Badge key={index}>
        {skill}
      </Badge>
    ))}
  </div>
</div>

<div className="rounded-xl border p-5 shadow-sm">
  <h2 className="text-lg font-bold">
    📄 ATS Score
  </h2>

  <p className="text-3xl font-bold text-blue-600 mt-3">
    {analysis.atsScore}/100
  </p>
</div>

<div className="rounded-xl border p-5 shadow-sm">
  <h2 className="text-lg font-bold">
    🎯 Interview Readiness
  </h2>

  <p className="mt-3 text-lg font-semibold">
    {analysis.interviewReadiness}
  </p>
</div>

<div className="rounded-xl border p-5 shadow-sm">
  <h2 className="text-lg font-bold mb-4">
    💡 Suggestions
  </h2>

  <ul className="space-y-3">
    {analysis.suggestions?.map((item, index) => (
      <li
        key={index}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
      >
        💡 {item}
      </li>
    ))}
  </ul>
</div>
</div>

</div>




  </SheetContent>
</Sheet>

    </div>
  )
}