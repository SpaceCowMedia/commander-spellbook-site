const isAprilsFoolsDayToday = () => {
  const today = new Date();
  return today.getMonth() === 3 && today.getDate() === 1;
};

const TODAY_IS_APRILS_FOOLS_DAY = isAprilsFoolsDayToday();

export default function isFoolsDay() {
  return TODAY_IS_APRILS_FOOLS_DAY;
}
