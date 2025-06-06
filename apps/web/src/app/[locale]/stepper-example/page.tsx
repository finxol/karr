import { Marquee } from "@karr/ui/components/marquee"
import { Stepper } from "@karr/ui/components/stepper"

import Loading from "@/components/Loading"

export default function StepperExample() {
    return (
        <>
            <div className="mt-10 h-4">
                <Loading />
            </div>

            <div className="full-width my-4 flex flex-col gap-4">
                <Marquee
                    direction="left"
                    className="bg-green-500 py-2 text-white"
                >
                    Karr is very cool
                </Marquee>

                <Marquee
                    direction="left"
                    className="bg-purple-500 py-2 text-white"
                >
                    It's made by finxol
                </Marquee>
            </div>

            <Stepper className="mt-12">
                <div>Step 1</div>
                <div>Step 2</div>
                <div>
                    Super wide step
                    <br />
                    Ste{"e".repeat(100)}ep
                    <br />
                    Step 3
                </div>
                <div>Step 4</div>
                <div>
                    Super tall step
                    <br />
                    <br />
                    Step 5
                </div>
                <div>Step 6</div>
                <div>Step 7</div>
                <div>Step 8</div>
            </Stepper>
        </>
    )
}
