import { useState, useCallback } from "react";
import Case from "@/components/Case";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { toast } from "@/utils/toast";

// ─── Field Type Options ──────────────────────────────────────────────────────
const FIELD_TYPES = [
    { value: "text", label: "Type Text" },
    { value: "number", label: "Type Number" },
    { value: "date", label: "Type Date" },
    { value: "textarea", label: "Textarea" },
    { value: "select", label: "Select Option" },
    { value: "email", label: "Type Email" },
    { value: "password", label: "Type Password" },
    { value: "boolean", label: "Boolean" },
    { value: "file", label: "Type File" },
    { value: "decimal", label: "Type Decimal" },
];

const EMPTY_COLUMN = { title: "", field: "", type: "text", validator: "", nullable: true, showInTable: true };

const DEFAULT_ENTITY = "";
const DEFAULT_USER_SCOPED = "no";
const DEFAULT_TIMESTAMPS = "yes";
const DEFAULT_COLUMNS = [{ title: "", field: "", type: "text", validator: "required", nullable: false, showInTable: true }];

export default function CrudGenerator() {
    useDocumentTitle("CRUD Generator");

    // ─── State ───────────────────────────────────────────────────────────
    const [entityName, setEntityName] = useState(DEFAULT_ENTITY);
    const [userScoped, setUserScoped] = useState(DEFAULT_USER_SCOPED);
    const [timestamps, setTimestamps] = useState(DEFAULT_TIMESTAMPS);
    const [columns, setColumns] = useState(DEFAULT_COLUMNS.map((c) => ({ ...c })));
    const [generatedCode, setGeneratedCode] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // ─── Column Handlers ─────────────────────────────────────────────────
    const addRow = () => setColumns((prev) => [...prev, { ...EMPTY_COLUMN }]);

    const removeRow = (index) => {
        if (columns.length <= 1) return;
        setColumns((prev) => prev.filter((_, i) => i !== index));
    };

    const updateColumn = (index, key, value) => {
        setColumns((prev) => prev.map((col, i) => (i === index ? { ...col, [key]: value } : col)));
    };

    const handleReset = () => {
        setEntityName("");
        setUserScoped("yes");
        setTimestamps("yes");
        setColumns([{ ...EMPTY_COLUMN }]);
        setGeneratedCode(null);
    };

    // ─── Code Generation ─────────────────────────────────────────────────
    const handleGenerate = useCallback(() => {
        if (!entityName.trim()) {
            toast.error("Entity Name is required");
            return;
        }
        const validColumns = columns.filter((c) => c.title.trim() && c.field.trim());
        if (validColumns.length === 0) {
            toast.error("At least one column with Title and Field is required");
            return;
        }

        setIsGenerating(true);

        try {
            const config = {
                entityName: entityName.trim(),
                userScoped: userScoped === "yes",
                timestamps: timestamps === "yes",
                columns: validColumns,
            };

            const code = generateAllCode(config);
            setGeneratedCode(code);
            toast.success("Code generated successfully!");
        } catch (err) {
            toast.error("Failed to generate code: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    }, [entityName, userScoped, timestamps, columns]);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard!`);
        });
    };

    // ─── Render ──────────────────────────────────────────────────────────
    return (
        <Case>
            <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                <h1 className="mb-1 tw-text-lg">CRUD Generator</h1>
                <p className="tw-text-sm tw-text-gray-500">Laravel (PHP) + React (Vite) — Full Stack</p>
            </div>

            <div className="section-body">
                {/* ── Config Card ── */}
                <div className="card">
                    <div className="card-body px-0">
                        <div className="row px-4">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>
                                        <strong>Entity Name</strong>
                                        <br />
                                        <small className="text-muted">PascalCase — Ex: Product, DataCategory</small>
                                    </label>
                                    <input type="text" className="form-control" placeholder="Product" value={entityName} onChange={(e) => setEntityName(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>
                                        <strong>User Scoped</strong>
                                        <br />
                                        <small className="text-muted">Setiap user punya datanya sendiri?</small>
                                    </label>
                                    <select className="form-control" value={userScoped} onChange={(e) => setUserScoped(e.target.value)}>
                                        <option value="yes">Yes (user_id foreign key)</option>
                                        <option value="no">No (global data)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>
                                        <strong>Timestamps</strong>
                                        <br />
                                        <small className="text-muted">created_at & updated_at</small>
                                    </label>
                                    <select className="form-control" value={timestamps} onChange={(e) => setTimestamps(e.target.value)}>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ── Columns Table ── */}
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="tw-bg-gray-50">
                                    <tr>
                                        <th className="tw-whitespace-nowrap">
                                            <strong>Title</strong>
                                            <br />
                                            <small className="text-muted">Ex: Name Product</small>
                                        </th>
                                        <th className="tw-whitespace-nowrap">
                                            <strong>Field</strong>
                                            <br />
                                            <small className="text-muted">Ex: name_product (snake_case)</small>
                                        </th>
                                        <th className="tw-whitespace-nowrap">
                                            <strong>Type</strong>
                                            <br />
                                            <small className="text-muted">Ex: Input Text</small>
                                        </th>
                                        <th className="tw-whitespace-nowrap">
                                            <strong>Validator</strong>
                                            <br />
                                            <small className="text-muted">Ex: required|max:255|string</small>
                                        </th>
                                        <th width="8%" className="text-center tw-whitespace-nowrap">
                                            <strong>Null</strong>
                                            <br />
                                            <small className="text-muted">Nullable?</small>
                                        </th>
                                        <th width="8%" className="text-center tw-whitespace-nowrap">
                                            <strong>Table</strong>
                                            <br />
                                            <small className="text-muted">Show?</small>
                                        </th>
                                        <th width="5%" className="text-center tw-whitespace-nowrap">
                                            <i className="fas fa-cog"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {columns.map((col, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <input type="text" className="form-control" placeholder="Nama Produk" value={col.title} onChange={(e) => updateColumn(idx, "title", e.target.value)} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" placeholder="nama_produk" value={col.field} onChange={(e) => updateColumn(idx, "field", e.target.value)} />
                                            </td>
                                            <td>
                                                <select className="form-control" value={col.type} onChange={(e) => updateColumn(idx, "type", e.target.value)}>
                                                    {FIELD_TYPES.map((ft) => (
                                                        <option key={ft.value} value={ft.value}>
                                                            {ft.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" placeholder="required|max:255" value={col.validator} onChange={(e) => updateColumn(idx, "validator", e.target.value)} />
                                            </td>
                                            <td className="text-center tw-align-middle">
                                                <input type="checkbox" className="tw-h-5 tw-w-5 tw-cursor-pointer" checked={col.nullable} onChange={(e) => updateColumn(idx, "nullable", e.target.checked)} />
                                            </td>
                                            <td className="text-center tw-align-middle">
                                                <input type="checkbox" className="tw-h-5 tw-w-5 tw-cursor-pointer" checked={col.showInTable} onChange={(e) => updateColumn(idx, "showInTable", e.target.checked)} />
                                            </td>
                                            <td className="text-center tw-align-middle">
                                                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(idx)} disabled={columns.length <= 1}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 tw-flex tw-justify-between">
                            <button type="button" className="btn btn-outline-danger" onClick={handleReset}>
                                <i className="fas fa-redo mr-1"></i> Reset All
                            </button>
                            <button type="button" className="btn btn-outline-primary" onClick={addRow}>
                                <i className="fas fa-plus mr-1"></i> Add Row
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Generated Code ── */}
                {generatedCode && (
                    <div className="card">
                        <div className="card-body">
                            <h4 className="mb-3">Generated Code</h4>
                            <ul className="nav nav-tabs" id="codeTab" role="tablist">
                                {generatedCode.map((file, idx) => (
                                    <li className="nav-item" key={idx}>
                                        <a className={`nav-link ${idx === 0 ? "active" : ""}${file.isCli ? " tw-font-bold" : ""}`} data-toggle="tab" href={`#tab-${idx}`} role="tab" style={file.isCli ? { background: idx === 0 ? "#1e1e1e" : "transparent", color: idx === 0 ? "#4ade80" : "#6c757d", borderColor: idx === 0 ? "#1e1e1e" : "" } : {}}>
                                            {file.isCli && <i className="fas fa-terminal mr-1"></i>}
                                            {file.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="tab-content mt-3">
                                {generatedCode.map((file, idx) => (
                                    <div className={`tab-pane fade ${idx === 0 ? "show active" : ""}`} id={`tab-${idx}`} role="tabpanel" key={idx}>
                                        <div className="tw-mb-2 tw-flex tw-items-center tw-justify-between">
                                            <code className={`tw-text-sm ${file.isCli ? "tw-text-green-500" : "tw-text-gray-500"}`}>
                                                {file.isCli && <i className="fas fa-terminal mr-1"></i>}
                                                {file.path}
                                            </code>
                                            <button className={`btn btn-sm ${file.isCli ? "btn-outline-success" : "btn-outline-primary"}`} onClick={() => copyToClipboard(file.code, file.label)}>
                                                <i className="fas fa-copy mr-1"></i> Copy
                                            </button>
                                        </div>
                                        {file.isCli && (
                                            <div className="alert alert-info tw-mb-3 tw-flex tw-items-start tw-gap-2">
                                                <i className="fas fa-info-circle tw-mt-1"></i>
                                                <small>
                                                    Copy kode ini, simpan sebagai <strong>crud-generate.sh</strong> di <strong>root project</strong>, lalu jalankan:
                                                    <br />
                                                    <code>chmod +x crud-generate.sh && ./crud-generate.sh</code>
                                                    <br />
                                                    Script ini otomatis membuat semua file backend (Laravel) & frontend (React) + migrate database.
                                                </small>
                                            </div>
                                        )}
                                        <pre className={`tw-max-h-[500px] tw-overflow-auto tw-rounded tw-p-4 tw-text-sm ${file.isCli ? "tw-bg-[#0d1117] tw-font-mono tw-text-[#58a6ff]" : "tw-bg-gray-900 tw-text-green-400"}`}>
                                            <code>{file.code}</code>
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── FAB Generate Button ── */}
            <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary tw-fixed tw-bottom-8 tw-right-8 tw-z-50 tw-flex tw-h-14 tw-w-14 tw-items-center tw-justify-center tw-rounded-full tw-shadow-lg tw-transition hover:tw-scale-110" title="Generate CRUD Code">
                {isGenerating ? <i className="fas fa-spinner fa-spin tw-text-xl"></i> : <i className="fas fa-code tw-text-xl"></i>}
            </button>
        </Case>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODE GENERATION ENGINE — Laravel + React (Vite)
// ═══════════════════════════════════════════════════════════════════════════════

function generateAllCode(config) {
    const { entityName, columns, timestamps, userScoped } = config;

    const pascal = toPascalCase(entityName);
    const camel = toCamelCase(entityName);
    const snake = toSnakeCase(entityName);
    const snakeTable = snake; // nama tabel tanpa plural
    const kebab = snake.replace(/_/g, "-");
    const pascalPlural = pascal; // folder & route label sama dengan entity

    const ctx = { pascal, camel, snake, snakeTable, kebab, pascalPlural, columns, timestamps, userScoped };

    return [
        { label: "⚡ CLI", path: `crud-${snake}.sh — simpan & jalankan dari root project`, code: genCliScript(ctx), isCli: true },
        { label: "Migration", path: `backend/database/migrations/xxxx_create_${snakeTable}_table.php`, code: genMigration(ctx) },
        { label: "Model", path: `backend/app/Models/${pascal}.php`, code: genModel(ctx) },
        { label: "Repository", path: `backend/app/Repositories/${pascal}Repository.php`, code: genRepository(ctx) },
        { label: "Service", path: `backend/app/Services/${pascal}Service.php`, code: genService(ctx) },
        { label: "Controller", path: `backend/app/Http/Controllers/Api/${pascal}Controller.php`, code: genController(ctx) },
        { label: "Routes", path: `backend/routes/api.php (append)`, code: genRoutesSnippet(ctx) },
        { label: "API Service", path: `frontend/src/services/api.js (append)`, code: genFrontendApi(ctx) },
        { label: "Hook", path: `frontend/src/hooks/use${pascal}.js`, code: genFrontendHook(ctx) },
        { label: "Page Hook", path: `frontend/src/pages/${pascal}/use${pascal}Page.js`, code: genFrontendPageHook(ctx) },
        { label: "Table", path: `frontend/src/pages/${pascal}/${pascal}Table.jsx`, code: genFrontendTable(ctx) },
        { label: "Modal", path: `frontend/src/pages/${pascal}/${pascal}Modal.jsx`, code: genFrontendModal(ctx) },
        { label: "Page", path: `frontend/src/pages/${pascal}/${pascal}.jsx`, code: genFrontendPage(ctx) },
        { label: "Router (add)", path: `frontend/src/App.jsx — tambah route`, code: genRouterSnippet(ctx) },
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Migration ───────────────────────────────────────────────────────────────
function genMigration({ snakeTable, columns, timestamps, userScoped }) {
    const cols = [];
    cols.push("            $table->id();");
    if (userScoped) {
        cols.push("            $table->foreignId('user_id')->constrained()->cascadeOnDelete();");
    }
    for (const c of columns) {
        const migType = mapMigrationType(c.type);
        const nullable = c.nullable ? "->nullable()" : "";
        if (c.type === "boolean") {
            cols.push(`            \$table->${migType}('${c.field}')->default(false)${nullable};`);
        } else {
            cols.push(`            \$table->${migType}('${c.field}')${nullable};`);
        }
    }
    if (timestamps) {
        cols.push("            $table->timestamps();");
    }

    return `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${snakeTable}', function (Blueprint \$table) {
${cols.join("\n")}
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${snakeTable}');
    }
};
`;
}

// ─── Repository ──────────────────────────────────────────────────────────────
function genRepository({ pascal, snakeTable, columns, userScoped, timestamps }) {
    const searchFields = columns.filter((c) => ["text", "textarea", "email"].includes(c.type));

    // Build select columns
    const selectCols = ["'id'"];
    if (userScoped) selectCols.push("'user_id'");
    columns.forEach((c) => selectCols.push(`'${c.field}'`));
    if (timestamps) selectCols.push("'created_at'", "'updated_at'");
    const selectStr = `->select([${selectCols.join(", ")}])`;

    const orderByStr = timestamps ? "->orderBy('created_at', 'desc')" : "->orderBy('id', 'desc')";

    const searchWhere = searchFields.length
        ? `
        if (\$search) {
            \$query->where(function (\$q) use (\$search) {
${searchFields.map((f, i) => `                \$q->${i === 0 ? "where" : "orWhere"}('${f.field}', 'like', "%{\$search}%");`).join("\n")}
            });
        }`
        : "";

    const paginateMethod = userScoped
        ? `
    public function paginateByUser(int \$userId, int \$page, int \$limit, string \$search = ''): array
    {
        \$query = DB::table(\$this->table)
            ${selectStr}
            ->where('user_id', \$userId)
            ${orderByStr};
${searchWhere}

        \$total = \$query->count();
        \$data  = \$query->offset((\$page - 1) * \$limit)->limit(\$limit)->get();

        return [
            'data'       => \$data,
            'total'      => \$total,
            'totalPages' => max(1, (int) ceil(\$total / \$limit)),
        ];
    }`
        : `
    public function paginate(int \$page, int \$limit, string \$search = ''): array
    {
        \$query = DB::table(\$this->table)
            ${selectStr}
            ${orderByStr};
${searchWhere}

        \$total = \$query->count();
        \$data  = \$query->offset((\$page - 1) * \$limit)->limit(\$limit)->get();

        return [
            'data'       => \$data,
            'total'      => \$total,
            'totalPages' => max(1, (int) ceil(\$total / \$limit)),
        ];
    }`;

    const findMethod = userScoped
        ? `
    public function findByIdAndUser(int \$id, int \$userId): ?object
    {
        return DB::table(\$this->table)
            ${selectStr}
            ->where('id', \$id)
            ->where('user_id', \$userId)
            ->first();
    }`
        : `
    public function findById(int \$id): ?object
    {
        return DB::table(\$this->table)
            ${selectStr}
            ->where('id', \$id)
            ->first();
    }`;

    return `<?php

namespace App\\Repositories;

use Illuminate\\Support\\Facades\\DB;

class ${pascal}Repository
{
    protected string \$table = '${snakeTable}';
${paginateMethod}
${findMethod}

    public function create(array \$data): object
    {
        \$id = DB::table(\$this->table)->insertGetId(${
            timestamps
                ? `array_merge(\$data, [
            'created_at' => now(),
            'updated_at' => now(),
        ])`
                : `\$data`
        });

        return DB::table(\$this->table)${selectStr}->where('id', \$id)->first();
    }

    public function update(int \$id, array \$data): object
    {
        DB::table(\$this->table)->where('id', \$id)->update(${
            timestamps
                ? `array_merge(\$data, [
            'updated_at' => now(),
        ])`
                : `\$data`
        });

        return DB::table(\$this->table)${selectStr}->where('id', \$id)->first();
    }

    public function delete(int \$id): int
    {
        return DB::table(\$this->table)->where('id', \$id)->delete();
    }
}
`;
}

// ─── Service ─────────────────────────────────────────────────────────────────
function genService({ pascal, camel, columns, userScoped, timestamps }) {
    const formatFields = columns
        .map((c) => {
            const camelField = toCamelCase(c.field);
            if (c.type === "boolean") return `            '${camelField}' => (bool) \$${camel}->${c.field},`;
            return `            '${camelField}' => \$${camel}->${c.field},`;
        })
        .join("\n");

    const createFields = columns
        .map((c) => {
            const isRequired = c.validator.includes("required");
            if (c.type === "boolean") return `            '${c.field}' => \$data['${c.field}'] ?? false,`;
            return `            '${c.field}' => \$data['${c.field}']${isRequired ? "" : " ?? null"},`;
        })
        .join("\n");

    const updateFields = columns.map((c) => `        if (isset(\$data['${c.field}'])) \$updateData['${c.field}'] = \$data['${c.field}'];`).join("\n");

    const listParams = userScoped ? "int $userId, int $page, int $limit, string $search = ''" : "int $page, int $limit, string $search = ''";
    const listCall = userScoped ? `\$this->${camel}Repo->paginateByUser(\$userId, \$page, \$limit, \$search)` : `\$this->${camel}Repo->paginate(\$page, \$limit, \$search)`;
    const findCall = userScoped ? `\$this->${camel}Repo->findByIdAndUser(\$id, \$userId)` : `\$this->${camel}Repo->findById(\$id)`;
    const showParams = userScoped ? "int $id, int $userId" : "int $id";
    const createParams = userScoped ? "int $userId, array $data" : "array $data";
    const updateParams = userScoped ? "int $id, int $userId, array $data" : "int $id, array $data";
    const deleteParams = userScoped ? "int $id, int $userId" : "int $id";
    const userIdCreate = userScoped ? "\n            'user_id' => $userId," : "";
    const timestampsFields = timestamps ? `\n            'createdAt'  => \\$${camel}->created_at,\n            'updatedAt'  => \\$${camel}->updated_at,` : "";

    return `<?php

namespace App\\Services;

use App\\Repositories\\${pascal}Repository;

class ${pascal}Service
{
    public function __construct(
        protected ${pascal}Repository \$${camel}Repo
    ) {}

    public function list(${listParams}): array
    {
        \$result = ${listCall};

        return [
            'data' => \$result['data']->map(fn (\$${camel}) => \$this->format(\$${camel}))->values()->all(),
            'meta' => [
                'page'       => \$page,
                'limit'      => \$limit,
                'total'      => \$result['total'],
                'totalPages' => \$result['totalPages'],
            ],
        ];
    }

    public function show(${showParams}): ?array
    {
        \$${camel} = ${findCall};
        return \$${camel} ? \$this->format(\$${camel}) : null;
    }

    public function create(${createParams}): array
    {
        \$${camel} = \$this->${camel}Repo->create([${userIdCreate}
${createFields}
        ]);

        return \$this->format(\$${camel});
    }

    public function update(${updateParams}): ?array
    {
        \$${camel} = ${findCall};
        if (! \$${camel}) return null;

        \$updateData = [];
${updateFields}

        \$updated = \$this->${camel}Repo->update(\$id, \$updateData);
        return \$this->format(\$updated);
    }

    public function delete(${deleteParams}): bool
    {
        \$${camel} = ${findCall};
        if (! \$${camel}) return false;

        \$this->${camel}Repo->delete(\$id);
        return true;
    }

    private function format(object \$${camel}): array
    {
        return [
            'id'         => \$${camel}->id,
${formatFields}
${timestampsFields}
        ];
    }
}
`;
}

// ─── Controller ──────────────────────────────────────────────────────────────
function genController({ pascal, camel, snakeTable, columns, userScoped }) {
    const storeRules = columns
        .map((c) => {
            const laravelRule = mapLaravelValidation(c);
            return `            '${c.field}' => '${laravelRule}',`;
        })
        .join("\n");

    const updateRules = columns
        .map((c) => {
            const laravelRule = mapLaravelValidation(c, true);
            return `            '${c.field}' => '${laravelRule}',`;
        })
        .join("\n");

    const fileFields = columns.filter((c) => c.type === "file").map((c) => c.field);
    const nonFileFields = columns
        .filter((c) => c.type !== "file")
        .map((c) => `'${c.field}'`)
        .join(", ");

    const listCall = userScoped
        ? `\$this->${camel}Service->list(
            \$request->user()->id,
            (int) \$request->input('page', 1),
            (int) \$request->input('limit', 10),
            (string) \$request->input('search', '')
        )`
        : `\$this->${camel}Service->list(
            (int) \$request->input('page', 1),
            (int) \$request->input('limit', 10),
            (string) \$request->input('search', '')
        )`;

    const showCall = userScoped ? `\$this->${camel}Service->show(\$id, \$request->user()->id)` : `\$this->${camel}Service->show(\$id)`;

    let dataAssembly = `\$data = \$request->only([${nonFileFields}]);`;
    let updateDataAssembly = `\$data = \$request->only([${nonFileFields}]);`;
    let destroyPreLogic = "";
    let destroyPostLogic = "";

    if (fileFields.length > 0) {
        fileFields.forEach((f) => {
            dataAssembly += `\n        if (\$request->hasFile('${f}')) {\n            \$data['${f}'] = \$request->file('${f}')->store('uploads/${snakeTable}', 'public');\n        }`;
        });

        updateDataAssembly += `\n\n        \$oldRecord = ${showCall};`;
        fileFields.forEach((f) => {
            const camelF = toCamelCase(f);
            updateDataAssembly += `\n        if (\$request->hasFile('${f}')) {\n            if (\$oldRecord && !empty(\$oldRecord['${camelF}'])) {\n                \\Illuminate\\Support\\Facades\\Storage::disk('public')->delete(\$oldRecord['${camelF}']);\n            }\n            \$data['${f}'] = \$request->file('${f}')->store('uploads/${snakeTable}', 'public');\n        }`;

            destroyPostLogic += `\n        if (\$oldRecord && !empty(\$oldRecord['${camelF}'])) {\n            \\Illuminate\\Support\\Facades\\Storage::disk('public')->delete(\$oldRecord['${camelF}']);\n        }`;
        });

        destroyPreLogic = `\$oldRecord = ${showCall};`;
    } else {
        const requestOnly = columns.map((c) => `'${c.field}'`).join(", ");
        dataAssembly = `\$data = \$request->only([${requestOnly}]);`;
        updateDataAssembly = `\$data = \$request->only([${requestOnly}]);`;
    }

    const storeCall = userScoped ? `\$this->${camel}Service->create(\n            \$request->user()->id,\n            \$data\n        )` : `\$this->${camel}Service->create(\n            \$data\n        )`;
    const updateCall = userScoped ? `\$this->${camel}Service->update(\n            \$id,\n            \$request->user()->id,\n            \$data\n        )` : `\$this->${camel}Service->update(\n            \$id,\n            \$data\n        )`;
    const deleteCall = userScoped ? `\$this->${camel}Service->delete(\$id, \$request->user()->id)` : `\$this->${camel}Service->delete(\$id)`;

    return `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Services\\${pascal}Service;
use App\\Traits\\ApiResponse;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Validator;

class ${pascal}Controller extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ${pascal}Service \$${camel}Service
    ) {}

    public function index(Request \$request): JsonResponse
    {
        \$result = ${listCall};

        return \$this->paginated(\$result['data'], \$result['meta']);
    }

    public function store(Request \$request): JsonResponse
    {
        \$validator = Validator::make(\$request->all(), [
${storeRules}
        ]);

        if (\$validator->fails()) {
            return \$this->validationError('Validasi gagal', \$validator);
        }

${dataAssembly}

        \$${camel} = ${storeCall};

        return \$this->success(\$${camel}, 'Data berhasil dibuat', 201);
    }

    public function show(Request \$request, int \$id): JsonResponse
    {
        \$${camel} = ${showCall};

        if (! \$${camel}) {
            return \$this->error('${pascal} tidak ditemukan', 404);
        }

        return \$this->success(\$${camel});
    }

    public function update(Request \$request, int \$id): JsonResponse
    {
        \$validator = Validator::make(\$request->all(), [
${updateRules}
        ]);

        if (\$validator->fails()) {
            return \$this->validationError('Validasi gagal', \$validator);
        }

        ${updateDataAssembly}

        \$${camel} = ${updateCall};

        if (! \$${camel}) {
            return \$this->error('${pascal} tidak ditemukan', 404);
        }

        return \$this->success(\$${camel}, 'Data berhasil diperbarui');
    }

    public function destroy(Request \$request, int \$id): JsonResponse
    {
        ${destroyPreLogic}
        \$deleted = ${deleteCall};

        if (! \$deleted) {
            return \$this->error('${pascal} tidak ditemukan', 404);
        }
        ${destroyPostLogic}

        return \$this->success(message: 'Data berhasil dihapus');
    }
}
`;
}

// ─── Routes Snippet ──────────────────────────────────────────────────────────
function genRoutesSnippet({ pascal, kebab }) {
    return `// Tambahkan di backend/routes/api.php:

// 1. Import di atas:
use App\\Http\\Controllers\\Api\\${pascal}Controller;

// 2. Tambahkan di dalam Route::middleware('auth:api')->group():
    Route::prefix('${kebab}')->group(function () {
        Route::get('/', [${pascal}Controller::class, 'index']);
        Route::post('/', [${pascal}Controller::class, 'store']);
        Route::get('/{id}', [${pascal}Controller::class, 'show']);
        Route::put('/{id}', [${pascal}Controller::class, 'update']);
        Route::delete('/{id}', [${pascal}Controller::class, 'destroy']);
    });
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRONTEND GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── API Service ─────────────────────────────────────────────────────────────
function genFrontendApi({ camel, kebab, columns }) {
    const hasFile = columns.some((c) => c.type === "file");
    if (hasFile) {
        return `// Tambahkan di frontend/src/services/api.js:

export const ${camel}Api = {
    getAll: (params) => apiClient.get("/${kebab}", { params }),
    create: (data) => apiClient.post("/${kebab}", data, { headers: { "Content-Type": "multipart/form-data" } }),
    show: (id) => apiClient.get(\`/${kebab}/\${id}\`),
    update: (id, data) => apiClient.post(\`/${kebab}/\${id}\`, data, { headers: { "Content-Type": "multipart/form-data" } }),
    remove: (id) => apiClient.delete(\`/${kebab}/\${id}\`),
};
`;
    }

    return `// Tambahkan di frontend/src/services/api.js:

export const ${camel}Api = {
    getAll: (params) => apiClient.get("/${kebab}", { params }),
    create: (data) => apiClient.post("/${kebab}", data),
    show: (id) => apiClient.get(\`/${kebab}/\${id}\`),
    update: (id, data) => apiClient.put(\`/${kebab}/\${id}\`, data),
    remove: (id) => apiClient.delete(\`/${kebab}/\${id}\`),
};
`;
}

// ─── TanStack Query Hook ─────────────────────────────────────────────────────
function genFrontendHook({ pascal, pascalPlural, camel }) {
    const KEY = snakeCaseToUpper(camel);

    return `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ${camel}Api } from "@/services/api";
import { toast } from "@/utils/toast";

const ${KEY}_KEY = "${toCamelCase(pascalPlural)}";

export function use${pascalPlural}({ page = 1, limit = 10, search = "" } = {}) {
    return useQuery({
        queryKey: [${KEY}_KEY, { page, limit, search }],
        queryFn: async () => {
            const { data } = await ${camel}Api.getAll({ page, limit, search });
            return data;
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useCreate${pascal}() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => ${camel}Api.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [${KEY}_KEY] });
            toast.success("Data created successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

export function useUpdate${pascal}() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => ${camel}Api.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [${KEY}_KEY] });
            toast.success("Data updated successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

export function useDelete${pascal}() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => ${camel}Api.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [${KEY}_KEY] });
            toast.success("Data deleted successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}
`;
}

// ─── Page Hook ───────────────────────────────────────────────────────────────
function genFrontendPageHook({ pascal, pascalPlural, camel, columns }) {
    const camelFields = columns.map((c) => ({ ...c, camelField: toCamelCase(c.field) }));

    const initialValues = camelFields.map((c) => (c.type === "boolean" ? `    ${c.camelField}: false,` : `    ${c.camelField}: "",`)).join("\n");

    const validationRules = camelFields
        .filter((c) => c.validator.includes("required"))
        .map((c) => `    ${c.camelField}: { required: "${c.title} is required" },`)
        .join("\n");

    const setValuesFields = camelFields
        .map((c) => {
            const isRequired = c.validator.includes("required");
            return `            ${c.camelField}: row.${c.camelField}${isRequired ? "" : ' || ""'},`;
        })
        .join("\n");

    const hasFile = columns.some((c) => c.type === "file");
    let payloadLogic = "";
    if (hasFile) {
        payloadLogic =
            `        const payload = new FormData();\n` +
            columns
                .map((c) => {
                    const camelField = toCamelCase(c.field);
                    if (c.type === "file") {
                        return `        if (formData.${camelField} instanceof File) payload.append('${c.field}', formData.${camelField});`;
                    } else {
                        return `        if (formData.${camelField} !== undefined && formData.${camelField} !== null) payload.append('${c.field}', formData.${camelField});`;
                    }
                })
                .join("\n") +
            `\n\n        if (isEditing) {\n            payload.append('_method', 'PUT');\n            updateMutation.mutate({ id: editId, data: payload }, { onSuccess, onError });\n        } else {\n            createMutation.mutate(payload, { onSuccess, onError });\n        }`;
    } else {
        payloadLogic = `        const payload = {\n` + columns.map((c) => `            '${c.field}': formData.${toCamelCase(c.field)},`).join("\n") + `\n        };\n\n        if (isEditing) {\n            updateMutation.mutate({ id: editId, data: payload }, { onSuccess, onError });\n        } else {\n            createMutation.mutate(payload, { onSuccess, onError });\n        }`;
    }

    return `import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@/hooks/useForm";
import { usePagination } from "@/hooks/usePagination";
import { use${pascalPlural}, useCreate${pascal}, useUpdate${pascal}, useDelete${pascal} } from "@/hooks/use${pascalPlural}";
import { validateForm, parseApiErrors } from "@/utils/validation";
import { toast } from "@/utils/toast";

const INITIAL_VALUES = {
${initialValues}
};

const VALIDATION_RULES = {
${validationRules}
};

export function use${pascal}Page() {
    const navigate = useNavigate();
    const pagination = usePagination();

    const {
        data: ${camel}Data,
        isLoading,
        isError,
    } = use${pascalPlural}({
        page: pagination.currentPage,
        limit: pagination.perPage,
        search: pagination.debouncedSearch,
    });

    const rows = ${camel}Data?.data ?? [];
    const totalPages = ${camel}Data?.meta?.totalPages ?? 1;
    const totalRows = ${camel}Data?.meta?.total ?? 0;

    const createMutation = useCreate${pascal}();
    const updateMutation = useUpdate${pascal}();
    const deleteMutation = useDelete${pascal}();

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const { formData, errors, handleChange, isValid, reset, setValues, setErrors } = useForm(INITIAL_VALUES, (data) => validateForm(data, VALIDATION_RULES));

    const isMutating = createMutation.isPending || updateMutation.isPending;

    const handleAdd = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
    };

    const handleEdit = (row) => {
        setIsEditing(true);
        setEditId(row.id);
        setValues({
${setValuesFields}
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid()) return;

        const onSuccess = () => {
            \$(".modal").modal("hide");
            reset();
        };

        const onError = (error) => {
            const resData = error.response?.data;
            if (resData?.errors && Array.isArray(resData.errors)) {
                const { formErrors } = parseApiErrors(resData);
                setErrors((prev) => ({ ...prev, ...formErrors }));
            }
        };

${payloadLogic}
    };

    const handleConfirmDelete = async (id) => {
        const result = await toast.confirmDelete();
        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    return {
        navigate,
        rows,
        totalPages,
        totalRows,
        isLoading,
        isError,
        pagination,
        formData,
        errors,
        handleChange,
        isEditing,
        isMutating,
        handleAdd,
        handleEdit,
        handleSubmit,
        handleConfirmDelete,
    };
}
`;
}

// ─── Table Component ─────────────────────────────────────────────────────────
function genFrontendTable({ pascal, columns }) {
    const tableCols = columns.filter((c) => c.showInTable);
    const camelCols = tableCols.map((c) => ({ ...c, camelField: toCamelCase(c.field) }));

    const thHeaders = camelCols.map((c) => `                            <th className="tw-whitespace-nowrap">${c.title}</th>`).join("\n");

    const tdCells = camelCols
        .map((c) => {
            if (c.type === "boolean") {
                return `                                    <td className="text-center">
                                        <span className={\`badge \${row.${c.camelField} ? "badge-success" : "badge-warning"}\`}>
                                            {row.${c.camelField} ? "Yes" : "No"}
                                        </span>
                                    </td>`;
            }
            if (c.type === "textarea") {
                return `                                    <td>{row.${c.camelField}?.length > 60 ? row.${c.camelField}.substring(0, 60) + "..." : (row.${c.camelField} || "-")}</td>`;
            }
            return `                                    <td>{row.${c.camelField} || "-"}</td>`;
        })
        .join("\n");

    const colSpan = camelCols.length + 2;

    return `import SearchEntries from "@/pages/Layout/Components/SearchEntries";
import Pagination from "@/pages/Layout/Components/Pagination";

export default function ${pascal}Table({ rows, pagination, totalRows, totalPages, onEdit, onConfirmDelete }) {
    return (
        <>
            <SearchEntries showing={pagination.perPage} handleShow={pagination.handlePerPageChange} searchTerm={pagination.search} handleSearch={pagination.handleSearch} />
            <div className="table-responsive">
                <table className="tw-w-full tw-table-auto">
                    <thead className="tw-sticky tw-top-0">
                        <tr className="tw-text-gray-700">
                            <th width="8%" className="text-center tw-whitespace-nowrap">No</th>
${thHeaders}
                            <th className="text-center tw-whitespace-nowrap">
                                <i className="fas fa-cog"></i>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="text-center">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</td>
${tdCells}
                                    <td className="text-center tw-whitespace-nowrap">
                                        <button onClick={() => onEdit(row)} className="btn btn-primary mr-2" data-toggle="modal" data-target="#formDataModal">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button onClick={() => onConfirmDelete(row.id)} className="btn btn-danger">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="${colSpan}" className="text-center">
                                    No data available in the table
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={pagination.currentPage} showing={pagination.perPage} totalRows={totalRows} totalPages={totalPages} handlePageChange={pagination.handlePageChange} />
        </>
    );
}
`;
}

// ─── Modal Component ─────────────────────────────────────────────────────────
function genFrontendModal({ pascal, columns }) {
    const camelFields = columns.map((c) => ({ ...c, camelField: toCamelCase(c.field) }));

    const componentTypes = new Set(camelFields.map((c) => mapFormComponent(c.type)));
    const imports = [];
    if (componentTypes.has("InputValidation")) imports.push('import InputValidation from "@/pages/Layout/Components/InputValidation";');
    if (componentTypes.has("TextareaValidation")) imports.push('import TextareaValidation from "@/pages/Layout/Components/TextareaValidation";');
    if (componentTypes.has("CheckboxValidation")) imports.push('import CheckboxValidation from "@/pages/Layout/Components/CheckboxValidation";');
    if (componentTypes.has("SelectValidation")) imports.push('import SelectValidation from "@/pages/Layout/Components/SelectValidation";');
    imports.push('import ModalFooter from "@/pages/Layout/Components/ModalFooter";');
    imports.push('import ModalHeader from "@/pages/Layout/Components/ModalHeader";');

    const formInputs = camelFields
        .map((c) => {
            const comp = mapFormComponent(c.type);
            if (comp === "TextareaValidation") {
                return `                            <TextareaValidation label="${c.title}" name="${c.camelField}" value={formData.${c.camelField}} onChange={onChange} error={errors.${c.camelField}} />`;
            }
            if (comp === "CheckboxValidation") {
                return `                            <CheckboxValidation label="${c.title}" name="${c.camelField}" checked={formData.${c.camelField}} onChange={onChange} error={errors.${c.camelField}} />`;
            }
            if (comp === "SelectValidation") {
                return `                            <SelectValidation label="${c.title}" name="${c.camelField}" value={formData.${c.camelField}} onChange={onChange} error={errors.${c.camelField}} options={[]} placeholder="-- Opsi Pilihan --" />`;
            }
            const inputType = mapInputType(c.type);
            return `                            <InputValidation label="${c.title}" name="${c.camelField}" type="${inputType}" value={formData.${c.camelField}} onChange={onChange} error={errors.${c.camelField}} />`;
        })
        .join("\n");

    return `${imports.join("\n")}

export default function ${pascal}Modal({ isEditing, isMutating, formData, errors, onChange, onSubmit }) {
    return (
        <div className="modal fade" id="formDataModal" aria-labelledby="formDataModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <ModalHeader isEditing={isEditing} />
                    <form onSubmit={onSubmit}>
                        <div className="modal-body">
${formInputs}
                        </div>
                        <ModalFooter isSubmitting={isMutating} />
                    </form>
                </div>
            </div>
        </div>
    );
}
`;
}

// ─── Page Component ──────────────────────────────────────────────────────────
function genFrontendPage({ pascal, pascalPlural }) {
    return `import Case from "@/components/Case";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import AddButton from "@/pages/Layout/Components/AddButton";
import { use${pascal}Page } from "./use${pascal}Page";
import ${pascal}Table from "./${pascal}Table";
import ${pascal}Modal from "./${pascal}Modal";

export default function ${pascal}() {
    useDocumentTitle("${pascalPlural}");

    const {
        navigate,
        rows,
        totalPages,
        totalRows,
        isLoading,
        isError,
        pagination,
        formData,
        errors,
        handleChange,
        isEditing,
        isMutating,
        handleAdd,
        handleEdit,
        handleSubmit,
        handleConfirmDelete,
    } = use${pascal}Page();

    if (isError) {
        navigate("/403");
        return null;
    }

    if (isLoading) {
        return (
            <Case>
                <div className="section-header">
                    <h1>Loading...</h1>
                </div>
            </Case>
        );
    }

    return (
        <Case>
            <div className="section-header">
                <h1>${pascalPlural}</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <h3>Table ${pascalPlural}</h3>
                    <div className="card-body">
                        <${pascal}Table
                            rows={rows}
                            pagination={pagination}
                            totalRows={totalRows}
                            totalPages={totalPages}
                            onEdit={handleEdit}
                            onConfirmDelete={handleConfirmDelete}
                        />
                    </div>
                </div>
                <AddButton handleAdd={handleAdd} />
            </div>

            <${pascal}Modal isEditing={isEditing} isMutating={isMutating} formData={formData} errors={errors} onChange={handleChange} onSubmit={handleSubmit} />
        </Case>
    );
}
`;
}

// ─── Router Snippet ──────────────────────────────────────────────────────────
function genRouterSnippet({ pascal, pascalPlural, kebab }) {
    return `// Tambahkan di Router/App.jsx:

// 1. Import:
import ${pascal} from "@/pages/${pascalPlural}/${pascal}";

// 2. Tambahkan route di dalam <Route element={<MainLayout />}>:
<Route path="/${kebab}" element={<${pascal} />} />
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI SCRIPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function genCliScript(ctx) {
    const { pascal, snake, snakeTable, kebab, pascalPlural } = ctx;

    const migrationCode = genMigration(ctx);
    const modelCode = genModel(ctx);
    const repositoryCode = genRepository(ctx);
    const serviceCode = genService(ctx);
    const controllerCode = genController(ctx);
    const hookCode = genFrontendHook(ctx);
    const pageHookCode = genFrontendPageHook(ctx);
    const tableCode = genFrontendTable(ctx);
    const modalCode = genFrontendModal(ctx);
    const pageCode = genFrontendPage(ctx);
    const apiLines = genFrontendApi(ctx)
        .split("\n")
        .filter((l) => !l.startsWith("//"))
        .join("\n")
        .trim();

    return `#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# CRUD Generator CLI — ${pascal}
# Stack: Laravel (PHP) + React (Vite)
# Jalankan dari root project: chmod +x crud-${snake}.sh && ./crud-${snake}.sh
# ═══════════════════════════════════════════════════════════════════════════════
set -e

TIMESTAMP=\$(date +"%Y_%m_%d_%H%M%S")

echo "🚀 Generating CRUD for ${pascal}..."

# ─── 1. Migration ─────────────────────────────────────────────────────────────
cat > "backend/database/migrations/\${TIMESTAMP}_create_${snakeTable}_table.php" << 'ENDOFFILE'
${migrationCode}ENDOFFILE
echo "✅ Migration created"

# ─── Model ────────────────────────────────────────────────────────────────────
cat > "backend/app/Models/${pascal}.php" << 'ENDOFFILE'
${modelCode}ENDOFFILE
echo "✅ ${pascal}.php"

# ─── 2. Repository ────────────────────────────────────────────────────────────
cat > backend/app/Repositories/${pascal}Repository.php << 'ENDOFFILE'
${repositoryCode}ENDOFFILE
echo "✅ ${pascal}Repository.php"

# ─── 3. Service ───────────────────────────────────────────────────────────────
cat > backend/app/Services/${pascal}Service.php << 'ENDOFFILE'
${serviceCode}ENDOFFILE
echo "✅ ${pascal}Service.php"

# ─── 4. Controller ────────────────────────────────────────────────────────────
mkdir -p backend/app/Http/Controllers/Api
cat > backend/app/Http/Controllers/Api/${pascal}Controller.php << 'ENDOFFILE'
${controllerCode}ENDOFFILE
echo "✅ ${pascal}Controller.php"

# ─── 5. Routes (api.php) ──────────────────────────────────────────────────────
if grep -q "${pascal}Controller" backend/routes/api.php; then
  echo "⚠️  Route ${pascal} sudah ada di api.php, skip."
else
  sed -i '/^use App\\\\Http\\\\Controllers\\\\Api\\\\/a use App\\\\Http\\\\Controllers\\\\Api\\\\${pascal}Controller;' backend/routes/api.php

  sed -i '/^});$/i\\
    // ${pascal} (CRUD)\\
    Route::prefix('"'"'${kebab}'"'"')->group(function () {\\
        Route::get('"'"'/'"'"', [${pascal}Controller::class, '"'"'index'"'"']);\\
        Route::post('"'"'/'"'"', [${pascal}Controller::class, '"'"'store'"'"']);\\
        Route::get('/{id}', [${pascal}Controller::class, 'show']);
        Route::put('/{id}', [${pascal}Controller::class, 'update']);
        Route::delete('/{id}', [${pascal}Controller::class, 'destroy']);
    });' backend/routes/api.php
  echo "✅ Routes added to api.php"
fi

# ─── 6. Run migration ─────────────────────────────────────────────────────────
(
  cd backend || exit 1
  php artisan migrate
)
echo "✅ Migration executed"

# ─── 7. Frontend API Service ──────────────────────────────────────────────────
if grep -q "${kebab}" frontend/src/services/api.js; then
  echo "⚠️  ${pascal} API sudah ada di api.js, skip."
else
  cat >> frontend/src/services/api.js << 'ENDOFFILE'

${apiLines}
ENDOFFILE
  echo "✅ API service appended"
fi

# ─── 8. Frontend Hook ─────────────────────────────────────────────────────────
cat > frontend/src/hooks/use${pascalPlural}.js << 'ENDOFFILE'
${hookCode}ENDOFFILE
echo "✅ use${pascalPlural}.js"

# ─── 9. Frontend Page Files ───────────────────────────────────────────────────
mkdir -p frontend/src/pages/${pascalPlural}

cat > frontend/src/pages/${pascalPlural}/use${pascal}Page.js << 'ENDOFFILE'
${pageHookCode}ENDOFFILE
echo "✅ use${pascal}Page.js"

cat > frontend/src/pages/${pascalPlural}/${pascal}Table.jsx << 'ENDOFFILE'
${tableCode}ENDOFFILE
echo "✅ ${pascal}Table.jsx"

cat > frontend/src/pages/${pascalPlural}/${pascal}Modal.jsx << 'ENDOFFILE'
${modalCode}ENDOFFILE
echo "✅ ${pascal}Modal.jsx"

cat > frontend/src/pages/${pascalPlural}/${pascal}.jsx << 'ENDOFFILE'
${pageCode}ENDOFFILE
echo "✅ ${pascal}.jsx"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  🎉 CRUD ${pascal} berhasil di-generate!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📌 Langkah manual:"
echo "  1. Tambahkan route di Router/App.jsx:"
echo "     import ${pascal} from \\"@/pages/${pascalPlural}/${pascal}\\";"
echo "     <Route path=\\"/${kebab}\\" element={<${pascal} />} />"
echo "  2. Tambahkan link di sidebar/navigation jika perlu."
echo "  3. Restart frontend dev server."
echo ""
echo "📌 Atau jika ingin membuat file secara manual:"
echo "  touch backend/app/Models/${pascal}.php backend/app/Repositories/${pascal}Repository.php backend/app/Services/${pascal}Service.php backend/app/Http/Controllers/Api/${pascal}Controller.php frontend/src/hooks/use${pascalPlural}.js frontend/src/pages/${pascalPlural}/use${pascal}Page.js frontend/src/pages/${pascalPlural}/${pascal}Table.jsx frontend/src/pages/${pascalPlural}/${pascal}Modal.jsx frontend/src/pages/${pascalPlural}/${pascal}.jsx"
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS: Type Mapping
// ═══════════════════════════════════════════════════════════════════════════════

function mapMigrationType(type) {
    if (type === "boolean") return "boolean";
    return "text";
}

function mapLaravelValidation(col, isUpdate = false) {
    const validators = col.validator
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean);

    const parts = [];
    const isRequired = validators.includes("required");

    if (isUpdate) {
        parts.push("sometimes");
        if (isRequired) parts.push("required");
    } else {
        parts.push(isRequired ? "required" : "nullable");
    }

    const typeMap = {
        text: "string|max:255",
        number: "integer",
        date: "date",
        textarea: "string",
        select: "string|max:255",
        email: "string|email|max:255",
        password: "string|min:6",
        boolean: "boolean",
        file: "file|max:10240",
        decimal: "numeric",
    };
    const typeRule = typeMap[col.type] || "string|max:255";
    parts.push(typeRule);

    validators
        .filter((v) => v !== "required" && v !== "string" && v !== "integer" && v !== "boolean" && v !== "numeric")
        .forEach((v) => {
            if (!parts.includes(v)) parts.push(v);
        });

    return parts.join("|");
}

function mapFormComponent(type) {
    const map = {
        text: "InputValidation",
        number: "InputValidation",
        date: "InputValidation",
        textarea: "TextareaValidation",
        select: "SelectValidation",
        email: "InputValidation",
        password: "InputValidation",
        boolean: "CheckboxValidation",
        file: "InputValidation",
        decimal: "InputValidation",
    };
    return map[type] || "InputValidation";
}

function mapInputType(type) {
    const map = { text: "text", number: "number", date: "date", email: "email", password: "password", decimal: "number", file: "file" };
    return map[type] || "text";
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS: String Transforms
// ═══════════════════════════════════════════════════════════════════════════════

function toPascalCase(str) {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase());
}

function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
        .replace(/[-\s]+/g, "_")
        .toLowerCase();
}

function snakeCaseToUpper(str) {
    return toSnakeCase(str).toUpperCase();
}

// ─── Model ───────────────────────────────────────────────────────────────────
function genModel({ pascal, snakeTable, columns, timestamps, userScoped }) {
    const fillable = columns.map((c) => `'${c.field}'`);
    if (userScoped) fillable.unshift("'user_id'");

    return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;

class ${pascal} extends Model
{
    use HasFactory;

    protected \$table = '${snakeTable}';
    
    public \$timestamps = ${timestamps ? "true" : "false"};

    protected \$fillable = [
        ${fillable.join(",\n        ")}
    ];
}
`;
}
