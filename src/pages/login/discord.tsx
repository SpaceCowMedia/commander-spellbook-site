import React, {useEffect, useState} from "react";
import ArtCircle from "../../components/layout/ArtCircle/ArtCircle";
import styles from "../report-error.module.scss";
import SpellbookHead from "../../components/SpellbookHead/SpellbookHead";
import {useRouter} from "next/router";
import TokenService from "../../services/token.service";
import UserService from "../../services/user.service";
import CookieService from "../../services/cookie.service";
import requestService from "../../services/request.service";

type Props = {};

const Login: React.FC<Props> = ({}: Props) => {

  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if(!router.isReady) return
    const code = router.query.code

    if (code) {
      requestService.post('/api/token/', {code})
        .then(data => {
          TokenService.setToken(data)
          const decodedToken = TokenService.decodeJwt(data.access)
          if (decodedToken) UserService.getPrivateUser(decodedToken.user_id).then(user => {
            CookieService.set('csbUsername', user.username, 'month')
            CookieService.set('csbUserId', user.id, 'month')
            if (user.isStaff) CookieService.set('csbIsStaff', 'true', 'month')
            router.query.final ? router.push(`/${router.query.final}`) : router.push('/')
          })
        }).catch(err => {
        setError(err.message)
      })
    }
  }, [router.isReady])

  return (
    <>
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
    </>
  );
};

export default Login;
