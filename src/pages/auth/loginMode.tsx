import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

interface PopupScreenProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    //isInstructor?: boolean;
    setIsInstructor?: (isInstructor: boolean) => void;
  }
  

export function LoginModeDialog({open, setOpen, setIsInstructor}: PopupScreenProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* <DialogTitle>Login Mode</DialogTitle> */}
          <DialogDescription className="text-sm font-bold text-muted-foreground">
            Do you want to continue with learner or Signup as instructor?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit"
          onClick={() => setIsInstructor && setIsInstructor(false)}>Continue as a Learner</Button>
          <Button
            type="submit"
            onClick={() => setIsInstructor && setIsInstructor(true)}
          >
            Signup as a Instructor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
