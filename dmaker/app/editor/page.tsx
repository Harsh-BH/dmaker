import React, { useState } from "react"
import ReadmeEditor from "@/components/editor/readme-editor"
import FlowchartGenerator from "@/components/editor/flowchart-generator"
import AiEnhanceButton from "@/components/editor/ai-enhance-button"
import SplitView from "@/components/layout/split-view"

export default function EditorPage() {
  const [readmeContent, setReadmeContent] = useState("")

  const handleContentChange = (content: string) => {
    setReadmeContent(content)
  }

  return (
    <SplitView>
      <div className="w-full md:w-1/2 p-4">
        <ReadmeEditor content={readmeContent} onContentChange={handleContentChange} />
        <AiEnhanceButton content={readmeContent} />
      </div>
      <div className="w-full md:w-1/2 p-4">
        <FlowchartGenerator content={readmeContent} />
      </div>
    </SplitView>
  )
}