"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Match } from "@/types";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface DeleteMatchModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteMatchModal = ({
  match,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMatchModalProps) => {
  const utils = trpc.useUtils();
  const deleteMatch = trpc.match.deleteMatch.useMutation({
    onSuccess: () => {
      toast.success("Match deleted successfully");
      utils.match.getAll.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to delete match: " + error.message);
    },
  });

  const handleDelete = () => {
    deleteMatch.mutate({ id: match.id });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent
          className="bg-[#0A0A0A] border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Match?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete this match?
              <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-zinc-300 font-semibold">
                  {match.homeTeam} <span className="text-zinc-600">vs</span> {match.awayTeam}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {match.league} • {match.date}
                </p>
              </div>
              <p className="mt-4 text-sm text-[#A91D3A]">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel
              className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleteMatch.isPending}
              className="bg-[#A91D3A] text-white hover:bg-[#A91D3A]/90"
            >
              {deleteMatch.isPending ? "Deleting..." : "Delete Match"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
