"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Share2, Copy, Check, Wifi, WifiOff } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useCanvasStore } from "@/lib/canvas-store"
import { collaborationManager, type CanvasOperation, type RemoteCursor } from "@/lib/collaboration"

export function CollaborationPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [newSessionName, setNewSessionName] = useState("")
  const [joinSessionId, setJoinSessionId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [connectedUsers, setConnectedUsers] = useState<RemoteCursor[]>([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const {
    setCollaborationMode,
    setSessionId,
    setRemoteCursors,
    collaborationMode,
    sessionId,
    paths,
    shapes,
    applyRemoteOperation,
  } = useCanvasStore()

  const isSupabaseAvailable = supabase !== null

  
  useEffect(() => {
    collaborationManager.setCallbacks({
      onRemoteOperation: (op: CanvasOperation) => {
        applyRemoteOperation(op)
      },
      onPresenceChange: (cursors: RemoteCursor[]) => {
        setConnectedUsers(cursors)
        setRemoteCursors(cursors)
      },
      onConnectionChange: (connected: boolean) => {
        setIsConnected(connected)
      },
      getFullState: () => {
        const state = useCanvasStore.getState()
        return { paths: state.paths, shapes: state.shapes }
      },
    })
  }, [applyRemoteOperation, setRemoteCursors])

  
  useEffect(() => {
    if (!isSupabaseAvailable) return

    const params = new URLSearchParams(window.location.search)
    const sessionParam = params.get("session")
    if (sessionParam) {
      setJoinSessionId(sessionParam)
      setIsDialogOpen(true)
    }
  }, [isSupabaseAvailable])

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !userName.trim()) {
      setError("Please enter your name and session name")
      return
    }

    try {
      setError("")
      const id = await collaborationManager.createAndJoin(newSessionName.trim(), userName.trim())
      setCollaborationMode(true)
      setSessionId(id)
      setSessionName(newSessionName.trim())
      setIsDialogOpen(false)
      setNewSessionName("")
    } catch (err) {
      setError("Failed to create session. Check your Supabase configuration.")
      console.error(err)
    }
  }

  const handleJoinSession = async () => {
    if (!joinSessionId.trim() || !userName.trim()) {
      setError("Please enter your name and session ID")
      return
    }

    try {
      setError("")
      await collaborationManager.join(joinSessionId.trim(), userName.trim())
      setCollaborationMode(true)
      setSessionId(joinSessionId.trim())
      setSessionName(`Session`)
      setIsDialogOpen(false)
      setJoinSessionId("")
    } catch (err) {
      setError("Failed to join session. Check the session ID and your connection.")
      console.error(err)
    }
  }

  const handleLeave = async () => {
    await collaborationManager.leave()
    setCollaborationMode(false)
    setSessionId(null)
    setSessionName("")
    setConnectedUsers([])
    setRemoteCursors([])
  }

  const copySessionLink = () => {
    if (sessionId) {
      const link = `${window.location.origin}?session=${sessionId}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isSupabaseAvailable) {
    return (
      <div className="flex">
        <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-60">
          <WifiOff className="h-4 w-4" />
          Collaborate
        </Button>
      </div>
    )
  }

  if (isConnected && collaborationMode) {
    return (
      <div className="flex flex-col gap-2">
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
          {}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-medium truncate max-w-[120px]">{sessionName}</span>
            </div>
            <div className="flex gap-0.5">
              <Button onClick={copySessionLink} size="sm" variant="ghost" className="h-7 w-7 p-0" title="Copy invite link">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
              </Button>
              <Button onClick={copySessionId} size="sm" variant="ghost" className="h-7 w-7 p-0" title="Copy session ID">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Connected users */}
          <div className="flex flex-wrap gap-1 mb-2">
            {/* Self */}
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: collaborationManager.currentUserColor + "20",
                color: collaborationManager.currentUserColor,
                borderColor: collaborationManager.currentUserColor + "40",
              }}
            >
              {collaborationManager.currentUserName} (You)
            </Badge>
            {connectedUsers.map((user) => (
              <Badge
                key={user.userId}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: user.userColor + "20",
                  color: user.userColor,
                  borderColor: user.userColor + "40",
                }}
              >
                {user.userName}
              </Badge>
            ))}
          </div>

          <Button onClick={handleLeave} size="sm" variant="outline" className="w-full h-7 text-xs">
            Leave Session
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Users className="h-4 w-4" />
            Collaborate
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Real-time Collaboration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Your Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Name</label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>

            {/* Create New Session */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-1.5 block">Create New Session</label>
              <div className="flex gap-2">
                <Input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Session name"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                />
                <Button onClick={handleCreateSession} size="sm" className="gap-1 shrink-0">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </div>
            </div>

            {/* Join Existing Session */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-1.5 block">Join by Session ID</label>
              <div className="flex gap-2">
                <Input
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value)}
                  placeholder="Paste session ID or link"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                />
                <Button onClick={handleJoinSession} size="sm" variant="outline" className="shrink-0">
                  Join
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Ask the session host to share their session ID or invite link
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
