import { memo } from "react"
import { cookies } from "next/headers"
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

export default async function Header() {
    const jar = await cookies()
    const isAuthenticated = jar.get("auth-token") !== undefined

    return (
        <header className="bg-transparent w-full sticky top-0 z-50 px-2">
            <div className="flex flex-row items-center justify-between mx-auto mt-2 px-2 py-2 max-w-[60rem] bg-card w-full rounded-md">
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
                    {isAuthenticated && <DesktopNavMenu />}
                </div>
                <div className="flex flex-row items-center justify-end gap-4">
                    {isAuthenticated && <MobileNavMenu />}
                    <nav className="flex flex-row items-center justify-end gap-4">
                        <LoginAccount />
                    </nav>
                </div>
            </div>
        </header>
    )
}
