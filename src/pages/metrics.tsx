import { IdentityEnum, VariantsApi } from '@space-cow-media/spellbook-client';
import ArtCircle from 'components/layout/ArtCircle/ArtCircle';
import ManaSymbol from 'components/layout/ManaSymbol/ManaSymbol';
import SpellbookHead from 'components/SpellbookHead/SpellbookHead';
import { LEGALITY_FORMATS } from 'lib/types';
import { GetServerSideProps } from 'next';
import React from 'react';
import { apiConfiguration } from 'services/api.service';
import styles from './metrics.module.scss';

type Count = {
  count: number;
};

type Props = {
  numberOfCombos: Count;
  numberOfVariants: Count;
  numberOfVariantsPerColorIdentity: Record<IdentityEnum, Count>;
  numberOfVariantsPerSupportedFormat: Record<string, Count>;
  numberOfVariantsPerCardCount: Record<string, Count>;
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
              <td>Number of Combos</td>
              <td>{stats.numberOfCombos.count}</td>
            </tr>
            <tr>
              <td>Number of Variants</td>
              <td>{stats.numberOfVariants.count}</td>
            </tr>
            <tr>
              <th>Card Count</th>
              <th>Variants</th>
            </tr>
            {Object.entries(stats.numberOfVariantsPerCardCount).map(([count, { count: variants }]) => (
              <tr key={count}>
                <td>{count}</td>
                <td>{variants}</td>
              </tr>
            ))}
            <tr>
              <th>Format</th>
              <th>Variants</th>
            </tr>
            {Object.entries(stats.numberOfVariantsPerSupportedFormat).map(([format, { count: variants }]) => (
              <tr key={format}>
                <td>{format}</td>
                <td>{variants}</td>
              </tr>
            ))}
            <tr>
              <th>Color Identities</th>
              <th>Variants</th>
            </tr>
            {Object.entries(stats.numberOfVariantsPerColorIdentity).map(([identity, { count: variants }]) => (
              <tr key={identity}>
                <td>
                  {identity
                    .toUpperCase()
                    .split('')
                    .map((color) => (
                      <ManaSymbol symbol={color} size="small" key={color} ariaHidden />
                    ))}
                </td>
                <td>{variants}</td>
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
  const numberOfCombos = (
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
        {
          count: (
            await variantsApi.variantsList({
              limit: 1,
              groupByCombo: false,
              q: `identity=${identity}`,
            })
          ).count,
        },
      ]),
    ),
  );
  const numberOfVariantsPerSupportedFormat = Object.fromEntries(
    await Promise.all(
      LEGALITY_FORMATS.filter(({ value }) => value).map(async ({ value, label }) => [
        label,
        {
          count: (
            await variantsApi.variantsList({
              limit: 1,
              groupByCombo: false,
              q: `format:${value}`,
            })
          ).count,
        },
      ]),
    ),
  );

  const numberOfVariantsPerCardCount = Object.fromEntries(
    await Promise.all(
      ['2', '3', '4', '5', '6+'].map(async (count) => [
        count,
        {
          count: (
            await variantsApi.variantsList({
              limit: 1,
              groupByCombo: false,
              q: count.endsWith('+') ? `card>=${count.substring(0, count.length - 1)}` : `card=${count}`,
            })
          ).count,
        },
      ]),
    ),
  );

  const props: Props = {
    numberOfCombos: {
      count: numberOfCombos,
    },
    numberOfVariants: {
      count: numberOfTotalVariants,
    },
    numberOfVariantsPerColorIdentity,
    numberOfVariantsPerSupportedFormat,
    numberOfVariantsPerCardCount,
  };

  return {
    props: props,
  };
};
