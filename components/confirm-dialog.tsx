import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

export type ConfirmDialogProps = {
  body: string;
  isOpen: boolean;
  action: string;
  onConfirm: (action: string) => void;
  onCancel: (action: string) => void;
};

export const ConfirmDialog = ({
  body,
  isOpen,
  action,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { isOpen: isCancelDialogOpen } = useDisclosure({ isOpen });
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen={isCancelDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => onCancel(action)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogBody>{body}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => onCancel(action)}>
              No
            </Button>
            <Button colorScheme="red" onClick={() => onConfirm(action)} ml={3}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
