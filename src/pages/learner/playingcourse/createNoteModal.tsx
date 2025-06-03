import {
  Dialog,
  DialogContent,
  DialogHeader,
  
} from "../../../components/ui/dialog";
import { useState } from "react";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { DialogTitle } from "../../../components/ui/dialog";

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: { heading: string; content: string }) => void;
}

export function CreateNoteDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateNoteDialogProps) {
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (heading.trim() && content.trim()) {
      onSubmit({ heading, content });
      setHeading("");
      setContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Note Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}