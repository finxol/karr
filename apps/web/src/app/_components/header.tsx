import { memo } from "react"
import Image from "next/image"

import { Link } from "@/i18n/routing"
import { APPLICATION_NAME } from "@/util/appname"
import logo from "@/assets/logo-tmp.jpg"

import LoginAccount from "./header/LoginAccount"
import { DesktopNavMenu, MobileNavMenu } from "./header/NavMenu"

const MemoizedAppName = memo(
    () => <h5>{APPLICATION_NAME}</h5>,
    () => false // Never update
)

export default function Header() {
    return (
        <header className="bg-background w-full sticky top-0 z-50 px-2">
            <div className="flex flex-row items-center justify-between mx-auto mt-2 px-2 py-2 max-w-[60rem] bg-primary/4 w-full rounded-md">
                <div className="flow-inline flex flex-row items-center justify-end">
                    <Link
                        href="/"
                        className="flex flex-row items-center justify-start gap-4"
                    >
                        <Image
                            alt="Karr"
                            src={logo}
                            width={40}
                            height={40}
                            className="rounded-md"
                            placeholder="blur"
                        />
                        <MemoizedAppName />
                    </Link>
                    <DesktopNavMenu />
                </div>
                <div className="flex flex-row items-center justify-end gap-4">
                    <MobileNavMenu />
                    <nav className="flex flex-row items-center justify-end gap-4">
                        <LoginAccount />
                    </nav>
                </div>
            </div>
        </header>
    )
}
