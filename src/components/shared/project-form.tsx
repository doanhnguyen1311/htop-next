import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export function ProjectForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Configuration</CardTitle>
        <CardDescription>
          Example accessible form controls for a production app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="project">Project name</Label>
            <Input id="project" placeholder="Nexus Realtime" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endpoint">Primary endpoint</Label>
            <Input id="endpoint" placeholder="https://api.example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add deployment notes..." />
          </div>
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline">
              Save draft
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button">
                  <Save />
                  Review launch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ready to launch?</DialogTitle>
                  <DialogDescription>
                    This modal uses Radix Dialog composition and the shared
                    button system.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="button">Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
