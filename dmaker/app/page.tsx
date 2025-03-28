import React from "react"
import SplitView from "@/components/layout/split-view"
import ReadmeEditor from "@/components/editor/readme-editor"
import FlowchartGenerator from "@/components/editor/flowchart-generator"
import AiEnhanceButton from "@/components/editor/ai-enhance-button"

export default function EditorPage() {
  return (
    <SplitView>
      <div className="flex flex-col w-full">
        <ReadmeEditor />
        <AiEnhanceButton />
      </div>
      <FlowchartGenerator />
    </SplitView>
  )
}