"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Tabs } from "./tabs";
import { Disclosure } from "./disclosure";

export default function Playground() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-16 px-4 py-16 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
                Accessible Component Playground
            </h1>

            {/* Modal section */}
            <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Modal Dialog</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="w-fit rounded-full bg-accent px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                    Open modal
                </button>
                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title="Example dialog"
                >
                    <p className="text-sm text-muted">
                        This modal traps focus and closes on Escape or backdrop click.
                    </p>
                    <button
                        onClick={() => setModalOpen(false)}
                        className="mt-4 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-hover"
                    >
                        Confirm
                    </button>
                </Modal>
            </section>
            {/* Tabs section */}
            <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Tabs</h2>
                <Tabs
                    tabs={[
                        { id: "ingredients", label: "Ingredients", content: <p>A list of ingredients would go here.</p> },
                        { id: "method", label: "Method", content: <p>Step-by-step cooking instructions would go here.</p> },
                        { id: "nutrition", label: "Nutrition", content: <p>Nutritional information would go here.</p> },
                    ]}
                />
            </section>
            {/* Disclosure section */}
            <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Disclosure</h2>
                <Disclosure summary="What is TheMealDB?">
                    <p className="pt-2">
                        TheMealDB is a free, open meal database with recipes from around
                        the world — no API key required for the public endpoints.
                    </p>
                </Disclosure>
                <Disclosure summary="How are favorites saved?">
                    <p className="pt-2">
                        Favorites persistence is planned for a later assignment once auth
                        is wired in.
                    </p>
                </Disclosure>
            </section>
        </main>
    );
}