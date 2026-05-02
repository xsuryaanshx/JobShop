import { useState, useEffect } from "react";
import { Settings, User, Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function ProfileDialog() {
  const [cvText, setCvText] = useState("");
  const [skills, setSkills] = useState("");
  const [preferences, setPreferences] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profile`);
      const data = await response.json();
      setCvText(data.cv_text || "");
      setSkills(data.skills || "");
      setPreferences(data.preferences || "{}");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: cvText, skills, preferences }),
      });
      toast.success("Profile updated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Your Profile
          </DialogTitle>
          <DialogDescription>
            Update your CV and preferences to help the AI tailor your applications.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex py-20 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cv">CV Text</Label>
              <Textarea
                id="cv"
                placeholder="Paste your CV content here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="min-h-[200px] rounded-2xl bg-secondary/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="React, Node.js, Python..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="rounded-xl bg-secondary/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prefs">Preferences (JSON)</Label>
              <Textarea
                id="prefs"
                placeholder='{"keywords": "software engineer", "location": "Remote"}'
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-[80px] rounded-2xl bg-secondary/30 font-mono text-[10px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
