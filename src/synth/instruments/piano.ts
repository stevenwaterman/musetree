import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Piano extends SimpleAbstractPolySynth<"piano"> {
    protected instrument = "piano" as const;
}
