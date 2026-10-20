import React from "react";
import Markdoc, { type Node } from "@markdoc/markdoc";
import { renderable } from "@/lib/content";

export function MarkdocContent({ node }: { node: Node }) {
  return <div className="prose">{Markdoc.renderers.react(renderable(node), React)}</div>;
}
