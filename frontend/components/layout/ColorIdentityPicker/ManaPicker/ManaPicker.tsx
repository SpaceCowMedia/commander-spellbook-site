import styles from './manaPicker.module.scss'
import ManaSymbol from "../../ManaSymbol/ManaSymbol";
import {ColorIdentityColors} from "../../../../lib/types";

type Props = {
  color: ColorIdentityColors
  value: ColorIdentityColors[]
  onChange: (value: ColorIdentityColors[]) => void
}

const ManaPicker = ({ color, value, onChange }: Props) => {
  const id = `${color}-picker-id`

  let colorName = ''
  if (color === 'w') colorName = 'White'
  if (color === 'u') colorName = 'Blue'
  if (color === 'b') colorName = 'Black'
  if (color === 'r') colorName = 'Red'
  if (color === 'g') colorName = 'Green'

  const isChecked = value.includes(color)

  const description = `Color Identity ${isChecked ? "includes" : "excludes"} ${colorName}. Press Enter key to toggle.`

  const handleChange = () => {
    const newValue = Array.from(value);

    if (isChecked) {
      const index = newValue.indexOf(color);
      newValue.splice(index, 1);
    } else newValue.push(color);

    onChange(newValue)
  }

  return  (
    <label htmlFor={id} tabIndex={0}>
      <span className="sr-only">{description}</span>
      <input className="hidden" id={id} value={color} onChange={handleChange} type="checkbox"/>
      <ManaSymbol symbol={color} className={`${styles.manaSymbol} ${!isChecked && 'opacity-50'}`} ariaHidden/>
    </label>
  )
}
export default ManaPicker