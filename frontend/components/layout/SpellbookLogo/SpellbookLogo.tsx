import React from "react"

type Props = {}

const SpellbookLogo: React.FC<Props> = ({}: Props) => {
  return (
    <div className="sm:flex mt-4 md:mt-0 justify-center">
      <div className="mb-4 sm:mb-0">
        <img
          src="/images/logo.svg"
          className="h-32 inline-block md:h-48 lg:h-56"
          alt="Commander Spellbook Logo"
          aria-hidden="true"
        />
      </div>
      <div className="sm:ml-4">
        <h1 className="sr-only">Commander Spellbook</h1>
        <img
          src="/images/title.svg"
          className="h-32 inline-block md:h-48 lg:h-56"
          alt="Commander Spellbook"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export default SpellbookLogo
