import React, {FormEvent, useEffect, useRef, useState} from "react";
import Link from "next/link";
import styles from "./searchBar.module.scss";
import { useRouter } from "next/router";
import UserDropdown from "../layout/UserDropdown/UserDropdown";
import {useCookies} from "react-cookie";
import {PaginatedResponse} from "types/api";
import {Variant} from "lib/types";
import requestService from "services/request.service";

type Props = {
  onHomepage?: boolean;
  className?: string;
};

const countUpToString = (count: number) => {
  const countString = count.toString();
  const countLength = countString.length;

  if (countLength < 5) return "0".repeat(5 - countLength) + countString;

  return countString;
}

const SearchBar: React.FC<Props> = ({ onHomepage, className }: Props) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const countUpRef = useRef<number>(20000);

  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(router.query.q);
  const [cookies, setCookies] = useCookies(["variantCount"])
  const [variantCount, setVariantCount] = useState<number>(20000)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (typeof inputValue === "string" && inputValue.trim()) {
      router.push(`/search/?q=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleCountUp = () => {
    if (!inputRef.current) return;
    if (countUpRef.current < 25000) {
      countUpRef.current +=  Math.floor(Math.random() * (200 - 100 + 1)) + 100;
      inputRef.current.placeholder = `Search ${countUpToString(countUpRef.current)} EDH combos`;
      setTimeout(handleCountUp, 50);
    } else if (cookies.variantCount) {
      inputRef.current.placeholder = `Search ${cookies.variantCount} EDH combos`;
    }
  }

  useEffect(() => {
    setInputValue(router.query.q);
  }, [router.query.q]);

  useEffect(() => {
    if (cookies.variantCount) setVariantCount(cookies.variantCount)
    else if (!cookies.variantCount) {
      requestService.get<PaginatedResponse<Variant>>(`https://backend.commanderspellbook.com/variants/?limit=1`)
        .then((response) => {
          setCookies("variantCount", response.count, {path: "/", maxAge: 604800})
        })
    }
    handleCountUp()
  }, []);



  return (
    <div className={`${styles.outerContainer} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.mainSearchInputContainer}>
        {!onHomepage && (
          <Link href="/" className="block mr-2 flex-shrink py-1">
            <div className="mr-1">
              <img
                src="/images/gear.svg"
                alt="Go to home page"
                className="w-8 inline-block"
              />
            </div>
          </Link>
        )}

        <div className="flex flex-grow items-center">
          {!onHomepage && (
            <div
              className={styles.searchInputIcon}
              aria-hidden="true"
              onClick={() => "focusSearch"}
            />
          )}
          <label
            htmlFor="search-bar-input"
            className="sr-only text-white"
            aria-hidden="true"
          >
            Combo Search
          </label>
          <input
            value={inputValue}
            name="q"
            ref={inputRef}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Search ${variantCount} EDH combos`}
            id="search-bar-input"
            type="text"
            className={`${styles.mainSearchInput} ${
              onHomepage ? "text-2xl text-center" : "pl-8 -ml-6"
            }`}
          />
        </div>

        {!onHomepage && (
          <div className="flex flex-shrink flex-row items-center desktop-menu">
            <button
              id="search-bar-menu-button"
              type="button"
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuIsOpen(!mobileMenuIsOpen)}
            >
              <div
                className={`${styles.menuIcon} ${styles.linkIcon}`}
                aria-hidden="true"
              />
              <div className="sr-only">Menu</div>
            </button>

            <Link
              href="/advanced-search/"
              className={`hidden md:flex ${styles.menuLink}`}
            >
              <div
                className={`${styles.advancedSearchIcon} ${styles.linkIcon}`}
                aria-hidden="true"
              />
              Advanced
            </Link>
            <Link
              href="/syntax-guide/"
              className={`hidden md:flex ${styles.menuLink}`}
            >
              <div
                className={`${styles.syntaxGuideIcon} ${styles.linkIcon}`}
                aria-hidden="true"
              />
              Syntax
            </Link>
            <Link
              href="/random"
              className={`hidden md:flex ${styles.menuLink}`}
            >
              <div
                className={`${styles.randomIcon} ${styles.linkIcon}`}
                aria-hidden="true"
              />
              Random
            </Link>
            <div className={styles.buttonContainer}>
              <UserDropdown/>
            </div>
          </div>
        )}
      </form>

      {!onHomepage && mobileMenuIsOpen && (
        <div
          className="md:hidden flex flex-wrap flex-row text-center mt-2 py-4 border-t border-light text-light"
          onClick={() => setMobileMenuIsOpen(!mobileMenuIsOpen)}
        >
          <Link href="/advanced-search/" className={styles.mobileMenuButton}>
            <div
              className={`${styles.advancedSearchIcon} ${styles.linkIcon}`}
              aria-hidden="true"
            />
            Advanced
          </Link>
          <Link href="/syntax-guide/" className={styles.mobileMenuButton}>
            <div
              className={`${styles.syntaxGuideIcon} ${styles.linkIcon}`}
              aria-hidden="true"
            />
            Syntax
          </Link>
          <Link href="/random" className={styles.mobileMenuButton}>
            <div
              className={`${styles.randomIcon} ${styles.linkIcon}`}
              aria-hidden="true"
            />
            Random
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
