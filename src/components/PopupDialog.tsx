import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"



interface PopupDialogProps {
  open:boolean,
  title:string,
  description:string
  onConfirm: (e:unknown)=> void | unknown;
  setOpen: (e:boolean)=>void
}
export function PopupDialog({open,title,description,onConfirm,setOpen}:PopupDialogProps) {
  return (
    <AlertDialog open={open}>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={()=> {setOpen(false)}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e)=> {
              
              onConfirm(e)
            }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  )
}