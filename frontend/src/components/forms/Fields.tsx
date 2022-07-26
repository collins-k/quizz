export function Field({name, value, onChange, children = null}) {

    return (
        <div className="d-flex">
            <label htmlFor={name} className="col-form-label">{children}</label>
            <div className="w-100 px-4">
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
