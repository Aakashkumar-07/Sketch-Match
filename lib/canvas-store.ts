import { create } from "zustand"
import type { CanvasPath, CanvasShape } from "@/types/canvas"
import { collaborationManager, type RemoteCursor, type CanvasOperation } from "@/lib/collaboration"

export type Tool = "select" | "hand" | "pen" | "rectangle" | "circle" | "arrow" | "line" | "text"

interface CanvasState {
  
  tool: Tool
  setTool: (tool: Tool) => void

  
  strokeColor: string
  setStrokeColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  fillColor: string
  setFillColor: (color: string) => void
  opacity: number
  setOpacity: (opacity: number) => void

  
  showGrid: boolean
  setShowGrid: (show: boolean) => void

  
  updateStrokeForTheme: (isDark: boolean) => void

  
  paths: CanvasPath[]
  shapes: CanvasShape[]
  addPath: (path: CanvasPath) => void
  addShape: (shape: CanvasShape) => void
  updateShape: (id: string, updates: Partial<CanvasShape>) => void
  deleteShape: (id: string) => void
  deletePath: (id: string) => void

  
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  deleteSelected: () => void

  
  stagePos: { x: number; y: number }
  setStagePos: (pos: { x: number; y: number }) => void
  stageScale: number
  setStageScale: (scale: number) => void

  
  history: Array<{ paths: CanvasPath[]; shapes: CanvasShape[] }>
  historyIndex: number
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  
  clearCanvas: () => void
  fitToScreen: () => void
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void

  
  collaborationMode: boolean
  setCollaborationMode: (mode: boolean) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
  remoteCursors: RemoteCursor[]
  setRemoteCursors: (cursors: RemoteCursor[]) => void
  applyRemoteOperation: (op: CanvasOperation) => void

  
  exportToJSON: () => string
  importFromJSON: (data: string) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  
  tool: "pen",
  setTool: (tool) => set({ tool }),

  
  strokeColor: "#000000",
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  strokeWidth: 2,
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  fillColor: "transparent",
  setFillColor: (fillColor) => set({ fillColor }),
  opacity: 1,
  setOpacity: (opacity) => set({ opacity }),

  
  showGrid: true,
  setShowGrid: (showGrid) => set({ showGrid }),

  
  updateStrokeForTheme: (isDark) => {
    const currentColor = get().strokeColor
    
    if (currentColor === "#000000" || currentColor === "#ffffff") {
      set({ strokeColor: isDark ? "#ffffff" : "#000000" })
    }
  },

  
  paths: [],
  shapes: [],
  addPath: (path) => {
    set((state) => ({ paths: [...state.paths, path] }))
    get().saveToHistory()

    
    if (get().collaborationMode) {
      collaborationManager.broadcastAddPath(path)
    }
  },
  addShape: (shape) => {
    set((state) => ({ shapes: [...state.shapes, shape] }))
    get().saveToHistory()

    
    if (get().collaborationMode) {
      collaborationManager.broadcastAddShape(shape)
    }
  },
  updateShape: (id, updates) => {
    set((state) => ({
      shapes: state.shapes.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape)),
    }))

    
    if (get().collaborationMode) {
      collaborationManager.broadcastUpdateShape(id, updates)
    }
  },
  deleteShape: (id) => {
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
    }))
    get().saveToHistory()

    if (get().collaborationMode) {
      collaborationManager.broadcastDeleteElements([id])
    }
  },
  deletePath: (id) => {
    set((state) => ({
      paths: state.paths.filter((path) => path.id !== id),
    }))
    get().saveToHistory()

    if (get().collaborationMode) {
      collaborationManager.broadcastDeleteElements([id])
    }
  },

  
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  clearSelection: () => set({ selectedIds: [] }),
  deleteSelected: () => {
    const { selectedIds, shapes, paths, collaborationMode } = get()
    set({
      shapes: shapes.filter((shape) => !selectedIds.includes(shape.id)),
      paths: paths.filter((path) => !selectedIds.includes(path.id)),
      selectedIds: [],
    })
    get().saveToHistory()

    if (collaborationMode && selectedIds.length > 0) {
      collaborationManager.broadcastDeleteElements(selectedIds)
    }
  },

  
  stagePos: { x: 0, y: 0 },
  setStagePos: (stagePos) => set({ stagePos }),
  stageScale: 1,
  setStageScale: (stageScale) => set({ stageScale }),

  
  history: [],
  historyIndex: -1,
  saveToHistory: () => {
    const { paths, shapes, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ paths: [...paths], shapes: [...shapes] })

    
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      set({ historyIndex: historyIndex + 1 })
    }

    set({ history: newHistory })
  },
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      set({
        paths: [...prevState.paths],
        shapes: [...prevState.shapes],
        historyIndex: historyIndex - 1,
        selectedIds: [],
      })
    }
  },
  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      set({
        paths: [...nextState.paths],
        shapes: [...nextState.shapes],
        historyIndex: historyIndex + 1,
        selectedIds: [],
      })
    }
  },
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  
  clearCanvas: () => {
    set({ paths: [], shapes: [], selectedIds: [] })
    get().saveToHistory()

    if (get().collaborationMode) {
      collaborationManager.broadcastClearCanvas()
    }
  },
  fitToScreen: () => {
    set({ stagePos: { x: 0, y: 0 }, stageScale: 1 })
  },
  resetZoom: () => {
    set({ stageScale: 1 })
  },
  zoomIn: () => {
    const currentScale = get().stageScale
    const newScale = Math.min(currentScale * 1.2, 5)
    set({ stageScale: newScale })
  },
  zoomOut: () => {
    const currentScale = get().stageScale
    const newScale = Math.max(currentScale / 1.2, 0.1)
    set({ stageScale: newScale })
  },

  
  collaborationMode: false,
  setCollaborationMode: (collaborationMode) => set({ collaborationMode }),
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),
  remoteCursors: [],
  setRemoteCursors: (remoteCursors) => set({ remoteCursors }),

  
  applyRemoteOperation: (op: CanvasOperation) => {
    switch (op.type) {
      case "add_path":
        set((state) => ({ paths: [...state.paths, op.path] }))
        break
      case "add_shape":
        set((state) => ({ shapes: [...state.shapes, op.shape] }))
        break
      case "update_shape":
        set((state) => ({
          shapes: state.shapes.map((shape) =>
            shape.id === op.id ? { ...shape, ...op.updates } : shape
          ),
        }))
        break
      case "delete_elements":
        set((state) => ({
          shapes: state.shapes.filter((s) => !op.ids.includes(s.id)),
          paths: state.paths.filter((p) => !op.ids.includes(p.id)),
          selectedIds: state.selectedIds.filter((id) => !op.ids.includes(id)),
        }))
        break
      case "clear_canvas":
        set({ paths: [], shapes: [], selectedIds: [] })
        break
      case "full_state":
        set({
          paths: op.paths,
          shapes: op.shapes,
          selectedIds: [],
        })
        break
      default:
        break
    }
    
    get().saveToHistory()
  },

  
  exportToJSON: () => {
    const { paths, shapes } = get()
    return JSON.stringify({ paths, shapes }, null, 2)
  },
  importFromJSON: (data) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.paths && parsed.shapes) {
        set({ paths: parsed.paths, shapes: parsed.shapes, selectedIds: [] })
        get().saveToHistory()
      }
    } catch (error) {
      console.error("Failed to import JSON:", error)
    }
  },
}))
