import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import { classNames } from "@library/helper";
import { DialogConsumer } from "@library/modal";
import { Fragment, memo, PropsWithChildren } from "react";
import { HiCheck, HiPencil } from "react-icons/hi";
import { serverStore, ServerType } from "renderer/stores/server";
import ServerEditDialog from "../ServerEditDialog";

interface Props {
  item: ServerType;
  active?: boolean;
}
interface PropsContextMenu {
  children?: (ctx: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
  }) => any;
}
function ServerItemContextMenu({
  children,
  item: server,
  active,
}: PropsContextMenu & Props) {
  const { isOpen, onClose, onToggle, onOpen } = useDisclosure();
  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="right-start">
      <PopoverTrigger>
        {children?.({ onToggle, onClose, isOpen, onOpen })}
      </PopoverTrigger>

      <Portal>
        <PopoverContent w="168px" className="py-2">
          <Button
            rounded="none"
            variant="ghost"
            disabled={active}
            onClick={() => !active && serverStore.setActive(server.name)}>
            Set active
          </Button>
          <DialogConsumer>
            {({ show }) => (
              <Button
                rounded="none"
                variant="ghost"
                onClick={() =>
                  show(ServerEditDialog, {
                    server,
                  })
                }>
                Edit
              </Button>
            )}
          </DialogConsumer>
          <MenuDivider />
          <Button color="red" rounded="none" variant="ghost">
            Delete
          </Button>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
function ServerItem({ item: server, active }: Props) {
  return (
    <ServerItemContextMenu item={server} active={active}>
      {({ isOpen, onOpen }) => (
        <div
          key={server.name}
          className={classNames(
            "bg-white text-gray-900 backdrop-filter backdrop-blur-lg px-4 py-3 rounded-lg shadow relative flex items-center select-none lg:w-64 lg:max-w-md",
            !active ? "cursor-pointer" : null
          )}
          onContextMenu={onOpen}>
          {active && (
            <HiCheck className="h-6 w-6 text-white bg-green-500 rounded-full p-1 flex-shrink-0 absolute top-1.5 right-1.5" />
          )}
          <div className="flex flex-col flex-1">
            <div className="truncate">{server.name}</div>
            <div className="truncate">{server.url}</div>
          </div>
        </div>
      )}
    </ServerItemContextMenu>
  );
}
export default memo(ServerItem);
