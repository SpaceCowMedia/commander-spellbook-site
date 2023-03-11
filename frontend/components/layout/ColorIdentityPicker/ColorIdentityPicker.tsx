import ManaPicker from "./ManaPicker/ManaPicker";
import {ColorIdentityColors} from "../../../lib/types";

type Props = {
  chosenColors: ColorIdentityColors[]
  onChange: (value: ColorIdentityColors[]) => void
}

const ColorIdentityPicker = ({ chosenColors, onChange }: Props) => {
  return(
      <div className="flex">
        <ManaPicker color="w" value={chosenColors} onChange={onChange} />
        <ManaPicker color="u" value={chosenColors} onChange={onChange} />
        <ManaPicker color="b" value={chosenColors} onChange={onChange} />
        <ManaPicker color="r" value={chosenColors} onChange={onChange} />
        <ManaPicker color="g" value={chosenColors} onChange={onChange} />
      </div>
    )
}

export default ColorIdentityPicker