import { UiNode, UiNodeTextAttributes, UiText } from "@ory/client"

interface Props {
    node: UiNode
    attributes: UiNodeTextAttributes
}

const Content = ({ attributes }: Props) => {
    switch (attributes.text.id) {
        case 1050015:
            return (
                <div className="container-fluid">
                    <div className="row">
                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                        {(attributes.text.context as any).secrets.map(
                            (text: UiText, k: number) => (
                                <div key={k} className="text-sm">
                                    <code>
                                        {text.id === 1050014 ? "Used" : text.text}
                                    </code>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )
    }

    return (
        <div className="w-full p-4 rounded-md border flex-wrap text-sm">
            {attributes.text.text}
        </div>
    )
}

export const NodeText = ({ node, attributes }: Props) => {
    return (
        <>
            <p className="text-lg">{node.meta?.label?.text}</p>
            <Content node={node} attributes={attributes} />
        </>
    )
}
