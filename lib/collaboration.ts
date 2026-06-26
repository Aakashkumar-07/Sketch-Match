import { supabase } from "@/lib/supabase/client"
import type { CanvasPath, CanvasShape } from "@/types/canvas"



export interface RemoteCursor {
  userId: string
  userName: string
  userColor: string
  x: number
  y: number
  lastSeen: number
}

export type CanvasOperation =
  | { type: "add_path"; path: CanvasPath }
  | { type: "add_shape"; shape: CanvasShape }
  | { type: "update_shape"; id: string; updates: Partial<CanvasShape> }
  | { type: "delete_elements"; ids: string[] }
  | { type: "clear_canvas" }
  | { type: "full_state"; paths: CanvasPath[]; shapes: CanvasShape[] }
  | { type: "request_state" }
  | { type: "cursor_move"; x: number; y: number }

export interface CollaborationCallbacks {
  onRemoteOperation: (op: CanvasOperation, senderId: string) => void
  onPresenceChange: (cursors: RemoteCursor[]) => void
  onConnectionChange: (connected: boolean) => void
  getFullState: () => { paths: CanvasPath[]; shapes: CanvasShape[] }
}



export class CollaborationManager {
  private channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null
  private userId: string
  private userName: string
  private userColor: string
  private sessionId: string | null = null
  private callbacks: CollaborationCallbacks | null = null
  private cursorThrottleTimer: ReturnType<typeof setTimeout> | null = null
  private isHost = false

  constructor() {
    this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.userName = ""
    this.userColor = this.generateColor()
  }

  private generateColor(): string {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F1948A", "#82E0AA",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  get connected(): boolean {
    return this.channel !== null && this.sessionId !== null
  }

  get currentUserId(): string {
    return this.userId
  }

  get currentUserName(): string {
    return this.userName
  }

  get currentUserColor(): string {
    return this.userColor
  }

  get currentSessionId(): string | null {
    return this.sessionId
  }

  get isSessionHost(): boolean {
    return this.isHost
  }

  setCallbacks(callbacks: CollaborationCallbacks) {
    this.callbacks = callbacks
  }

  

  async createAndJoin(sessionName: string, userName: string): Promise<string> {
    if (!supabase) throw new Error("Supabase not configured")

    this.userName = userName
    this.isHost = true

    
    const sessionId = `sm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    
    
    try {
      await supabase.from("canvas_sessions").insert([{
        id: sessionId,
        name: sessionName,
      }])
    } catch {
      
    }

    await this.joinChannel(sessionId)
    return sessionId
  }

  async join(sessionId: string, userName: string): Promise<void> {
    if (!supabase) throw new Error("Supabase not configured")

    this.userName = userName
    this.isHost = false
    await this.joinChannel(sessionId)

    
    setTimeout(() => {
      this.broadcast({ type: "request_state" })
    }, 500)
  }

  private async joinChannel(sessionId: string) {
    if (!supabase) return

    this.sessionId = sessionId

    const channel = supabase.channel(`sketch-match-${sessionId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: this.userId },
      },
    })

    
    channel.on("broadcast", { event: "canvas_op" }, ({ payload }) => {
      if (!payload || !this.callbacks) return
      const { operation, senderId } = payload as {
        operation: CanvasOperation
        senderId: string
      }
      if (senderId === this.userId) return

      if (operation.type === "request_state") {
        
        if (this.isHost) {
          const state = this.callbacks.getFullState()
          this.broadcast({
            type: "full_state",
            paths: state.paths,
            shapes: state.shapes,
          })
        }
      } else {
        this.callbacks.onRemoteOperation(operation, senderId)
      }
    })

    
    channel.on("presence", { event: "sync" }, () => {
      if (!this.callbacks) return

      const presenceState = channel.presenceState<{
        user_name: string
        user_color: string
        cursor_x: number
        cursor_y: number
      }>()

      const cursors: RemoteCursor[] = []
      for (const [userId, presences] of Object.entries(presenceState)) {
        if (userId === this.userId) continue
        const latest = presences[presences.length - 1]
        if (latest) {
          cursors.push({
            userId,
            userName: latest.user_name,
            userColor: latest.user_color,
            x: latest.cursor_x ?? 0,
            y: latest.cursor_y ?? 0,
            lastSeen: Date.now(),
          })
        }
      }

      this.callbacks.onPresenceChange(cursors)
    })

    
    await channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_name: this.userName,
          user_color: this.userColor,
          cursor_x: 0,
          cursor_y: 0,
        })
        this.callbacks?.onConnectionChange(true)
      }
    })

    this.channel = channel
  }

  async leave() {
    if (this.channel) {
      await this.channel.untrack()
      await this.channel.unsubscribe()
      this.channel = null
    }
    this.sessionId = null
    this.isHost = false
    this.callbacks?.onConnectionChange(false)
    this.callbacks?.onPresenceChange([])
  }

  

  broadcast(operation: CanvasOperation) {
    if (!this.channel) return

    this.channel.send({
      type: "broadcast",
      event: "canvas_op",
      payload: {
        operation,
        senderId: this.userId,
      },
    })
  }

  broadcastCursor(x: number, y: number) {
    if (!this.channel) return

    
    if (this.cursorThrottleTimer) return
    this.cursorThrottleTimer = setTimeout(() => {
      this.cursorThrottleTimer = null
    }, 33)

    this.channel.track({
      user_name: this.userName,
      user_color: this.userColor,
      cursor_x: x,
      cursor_y: y,
    })
  }

  

  broadcastAddPath(path: CanvasPath) {
    this.broadcast({ type: "add_path", path })
  }

  broadcastAddShape(shape: CanvasShape) {
    this.broadcast({ type: "add_shape", shape })
  }

  broadcastUpdateShape(id: string, updates: Partial<CanvasShape>) {
    this.broadcast({ type: "update_shape", id, updates })
  }

  broadcastDeleteElements(ids: string[]) {
    this.broadcast({ type: "delete_elements", ids })
  }

  broadcastClearCanvas() {
    this.broadcast({ type: "clear_canvas" })
  }
}


export const collaborationManager = new CollaborationManager()
