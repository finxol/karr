import Image from "next/image"
import { UiNode, UiNodeImageAttributes } from "@ory/client"

interface Props {
    node: UiNode
    attributes: UiNodeImageAttributes
}

export const NodeImage = ({ node, attributes }: Props) => {
    return (
        <Image
            src={attributes.src}
            width={200}
            height={200}
            alt={node.meta.label?.text || ""}
        />
    )
}
