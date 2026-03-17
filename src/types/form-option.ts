export interface FormOption {
    list: FormOptionList[];
    labelWidth?: number | string;
    span?: number;

}

export interface FormOptionList {
    prop: string;
    label: string;
    type: string;
    span?: number;
    // for textarea inputs
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    opts?: any[];
    multiple?: boolean;
    remote?: boolean;
    remoteMethod?: (query: string) => void;
    filterable?: boolean;
    inputStyle?: any;
    format?: string;
    activeValue?: any;
    inactiveValue?: any;
    activeText?: string;
    inactiveText?: string;
    required?: boolean;
    onChange?: (value: unknown, form: Record<string, unknown>) => void;
}
