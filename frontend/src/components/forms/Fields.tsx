export function Field({name, value, onChange, children = null}) {

    return (
        <div className="grid gap-0 align-items-center justify-items-start mt-4">
            <label htmlFor={name} className="g-col-12 g-col-sm-3 g-col-md-2 text-start">{children}</label>
            <div className="g-col-12 g-col-sm-9 g-col-md-10">
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="form-control"
                />
            </div>
        </div>
    );
}
