import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

  interface DeleteConfirmationProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onConfirm: (e:any)=> void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buttonContent:any;
    dialogContent:string
  }
  
  export function AlertDialogButton({onConfirm,buttonContent,dialogContent}:DeleteConfirmationProps) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button>{buttonContent}</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  