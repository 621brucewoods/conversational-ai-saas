import React from "react";
import { Button } from "@/components/ui/button";
import {
  IconDotsVertical,
  IconFolder,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

interface SidebarProps {
  folders: any[];
  currentFolder: any;
  setCurrentFolder: (folder: any) => void;
  setIsAddGroupModalOpen: (open: boolean) => void;
  handleDeleteGroup: (folderId: any) => void;
  menuOpenFolderId: any;
  setMenuOpenFolderId: (id: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  folders,
  currentFolder,
  setCurrentFolder,
  setIsAddGroupModalOpen,
  handleDeleteGroup,
  menuOpenFolderId,
  setMenuOpenFolderId,
}) => {
  return (
    <aside className="w-64 bg-secondary border-r border-stone-300 dark:border-stone-600 shadow-md pt-3">
      <div className="flex justify-center px-4 py-4 border-b border-gray-300 dark:border-stone-600">
        <Button onClick={() => setIsAddGroupModalOpen(true)}>
          <IconPlus size={16} stroke={2} className="mr-2" />
          Add Group
        </Button>
      </div>

      <nav className="overflow-y-auto h-full px-4 pt-4">
        <ul className="space-y-2">
          {folders.map((folder: any) => (
            <li
              key={folder.id}
              className={`group flex items-center justify-between hover:bg-muted rounded-md px-3 py-2 cursor-pointer text-foreground ${
                currentFolder && currentFolder.id === folder.id
                  ? "bg-accent"
                  : ""
              }`}
              onClick={() => setCurrentFolder(folder)}
            >
              <div className="flex items-center">
                <IconFolder size={20} className="text-foreground" />
                <span className="ml-3 text-sm font-medium">{folder.name}</span>
              </div>

              {folder.id !== "all-documents" && (
                <div className="relative">
                  <button
                    className="text-foreground hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFolderId(
                        menuOpenFolderId === folder.id ? null : folder.id
                      );
                    }}
                  >
                    <IconDotsVertical size={16} />
                  </button>

                  {menuOpenFolderId === folder.id && (
                    <div
                      id={`folder-menu-${folder.id}`}
                      className="absolute right-0 mt-2 w-28 bg-accent border border-stone-300 dark:border-stone-600 rounded shadow-md z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add update folder functionality here
                          setMenuOpenFolderId(null);
                        }}
                      >
                        <IconPencil size={16} className="mr-2" />
                        Update
                      </button>

                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(folder.id);
                          setMenuOpenFolderId(null);
                        }}
                      >
                        <IconTrash size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
