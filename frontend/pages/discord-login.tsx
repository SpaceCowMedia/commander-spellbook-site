import React, {useEffect, useState} from "react";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import styles from "./report-error.module.scss";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {v4 as uuid4} from "uuid";
import {useRouter} from "next/router";
import {useCookies} from "react-cookie";

type Props = {};

const Login: React.FC<Props> = ({}: Props) => {

  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if(!router.isReady) return
    const code = router.query.code

    console.log(code)

    if (code) {
      console.log('yo')
      fetch(`https://backend.commanderspellbook.com/token/`, {
        method: 'POST',
        body: JSON.stringify({
          code,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json())
        .then(data => {
          console.log(data)
          router.push('/')
        }).catch(err => {
          setError(err.message)
        })
    }
  }, [router.isReady])

  return (
    <PageWrapper>
      <SpellbookHead
        title="Logging in."
        description="Discord logging in."
      />
      <div className={`static-page ${styles.reportErrorContainer}`}>
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Logging in...</h1>
        <p className='text-center'>
          You will be redirected automatically once the login is complete.
        </p>
        {error &&
          <p className='bg-red-100 p-3 rounded border border-red-200'>
            {error}
          </p>}
      </div>
    </PageWrapper>
  );
};

export default Login;
