import { IdentityEnum, VariantsApi } from '@space-cow-media/spellbook-client';
import ArtCircle from 'components/layout/ArtCircle/ArtCircle';
import ManaSymbol from 'components/layout/ManaSymbol/ManaSymbol';
import SpellbookHead from 'components/SpellbookHead/SpellbookHead';
import { LEGALITY_FORMATS } from 'lib/types';
import { GetServerSideProps } from 'next';
import React from 'react';
import { apiConfiguration } from 'services/api.service';
import styles from './metrics.module.scss';

type Props = {
  numberOfTotalCombos: number;
  numberOfTotalVariants: number;
  numberOfVariantsPerColorIdentity: Record<IdentityEnum, number>;
  numberOfVariantsPerSupportedFormat: Record<string, number>;
};

const Metrics: React.FC<Props> = (stats) => {
  return (
    <>
      <SpellbookHead title="Metrics" description="Commander Spellbook metrics" />
      <div className="static-page">
        <ArtCircle cardName="The Grand Calcutron" className="m-auto md:block hidden" />
        <h1 className="heading-title text-center">Metrics</h1>
        <table className={styles.metrics}>
          <tbody>
            <tr>
              <th>Stat</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Number of total combos</td>
              <td>{stats.numberOfTotalCombos}</td>
            </tr>
            <tr>
              <td>Number of total variants</td>
              <td>{stats.numberOfTotalVariants}</td>
            </tr>
            <tr>
              <th>Format</th>
              <th>Variants</th>
            </tr>
            {Object.entries(stats.numberOfVariantsPerSupportedFormat).map(([format, count]) => (
              <tr key={format}>
                <td>{format}</td>
                <td>{count}</td>
              </tr>
            ))}
            <tr>
              <th>Color Identities</th>
              <th>Variants</th>
            </tr>
            {Object.entries(stats.numberOfVariantsPerColorIdentity).map(([identity, count]) => (
              <tr key={identity}>
                <td>
                  {identity
                    .toUpperCase()
                    .split('')
                    .map((color) => (
                      <ManaSymbol symbol={color} size="small" key={color} ariaHidden />
                    ))}
                </td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Metrics;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const configuration = apiConfiguration(context);
  const variantsApi = new VariantsApi(configuration);
  const numberOfTotalCombos = (
    await variantsApi.variantsList({
      limit: 1,
      groupByCombo: true,
    })
  ).count;
  const numberOfTotalVariants = (
    await variantsApi.variantsList({
      limit: 1,
      groupByCombo: false,
    })
  ).count;
  const numberOfVariantsPerColorIdentity = Object.fromEntries(
    await Promise.all(
      Object.values(IdentityEnum).map(async (identity) => [
        identity,
        (
          await variantsApi.variantsList({
            limit: 1,
            groupByCombo: false,
            q: `identity=${identity}`,
          })
        ).count,
      ]),
    ),
  );
  const numberOfVariantsPerSupportedFormat = Object.fromEntries(
    await Promise.all(
      LEGALITY_FORMATS.filter(({ value }) => value).map(async ({ value, label }) => [
        label,
        (
          await variantsApi.variantsList({
            limit: 1,
            groupByCombo: false,
            q: `format:${value}`,
          })
        ).count,
      ]),
    ),
  );

  return {
    props: {
      numberOfTotalCombos,
      numberOfTotalVariants,
      numberOfVariantsPerColorIdentity,
      numberOfVariantsPerSupportedFormat,
    },
  };
};
