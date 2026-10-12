import type { ChatMessages } from "@openrouter/sdk/models";
import { PINNED_MESSAGE_COUNT } from "../../constants";
import { openRouter } from "../../config";

async function summarizeMessages(messages: ChatMessages[]) {
  
  //1st two messages
  const pinned = messages.slice(0, PINNED_MESSAGE_COUNT);
  
  const history = messages.slice(PINNED_MESSAGE_COUNT);

  if (history.length === 0) {
    return;
  }

  console.log(`Summarizing ${history.length} messages...`);

  //simple llm call for summarization
  const result = await openRouter.chat.send({
    chatRequest: {
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You compress the working history of a coding agent so it can continue its task. Write a concise but complete summary covering: what has been explored, commands run and their key results, important file paths and contents/findings, decisions made, and what remains to be done. Do not drop facts the agent will need to finish the task.",
        },
        {
          role: "user",
          content: `Original task:\n${JSON.stringify(pinned[1]?.content)}\n\nHistory to summarize:\n${JSON.stringify(history)}`,
        },
      ],
      stream: false,
    },
  });

  if (!("choices" in result)) {
    throw new Error("Expected a non-streaming response");
  }

  const summary = result.choices[0]?.message.content;

  if (!summary) {
    throw new Error("Expected the model to return a summary");
  }

  messages.splice(PINNED_MESSAGE_COUNT, history.length, {
    role: "user",
    content: `Summary of your progress so far (earlier messages were compacted to save context):\n\n${typeof summary === "string" ? summary : JSON.stringify(summary)}\n\nContinue the task from here.`,
  });
}

export { summarizeMessages };
