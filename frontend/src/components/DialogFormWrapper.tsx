import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Separator } from "./ui/separator";

interface DialogFormWrapperProps {
  children: React.ReactNode;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  title: string;
  buttonName: string;
  buttonSubmitName: string;
}

export default function DialogFormWrapper({
  children,
  onSubmit,
  isSubmitting,
  title,
  buttonName,
  buttonSubmitName,
}: DialogFormWrapperProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="text-sm md:text-base ">
          {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto bg-white">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl py-5">{title}</DialogTitle>
          </DialogHeader>

          <Separator />

          {children}

          <Separator />

          <DialogFooter>
            <Button
              className="w-full my-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirmando..." : buttonSubmitName}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
