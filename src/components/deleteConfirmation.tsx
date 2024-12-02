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
  import { Button } from "@/components/ui/button"

  interface DeleteConfirmationProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onConfirm: (e:any)=> void;
    buttonContent:any
  }
  
  export function DeleteConfirmation({onConfirm,buttonContent}:DeleteConfirmationProps) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button>{buttonContent}</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this interview.
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
  