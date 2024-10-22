import React from "react";

import * as Dialog from "@radix-ui/react-dialog";
import classes from "./FileModal.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";

const FileModal = ({ file }) => {
  const fileURL = URL.createObjectURL(file);
  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className={classes.DialogOverlay} />
        <Dialog.Content className={classes.DialogContent}>
          <Dialog.Title className={classes.DialogTitle}>
            {file.name}
          </Dialog.Title>
          <Dialog.Description>
            <embed src={fileURL} type={file.type} width="100%" height="500px" />
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className={classes.IconButton} aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
};

export default FileModal;
