import type {LicenseMachine} from '../../../lib/queries';

interface Props {
    machineLock: boolean;
    onToggle: () => void;
    maxMachines: number;
    onMaxMachinesChange: (n: number) => void;
    machines: LicenseMachine[];
    onRemoveMachine: (machineId: string) => void;
    removePending: boolean;
}

export function MachineLockSection({machineLock, onToggle, maxMachines, onMaxMachinesChange, machines, onRemoveMachine, removePending}: Props) {
    return (
        <div className="border-t border-gray-800 pt-4">
            <MachineLockToggle enabled={machineLock} onToggle={onToggle}/>

            {machineLock && (
                <MaxMachinesInput value={maxMachines} onChange={onMaxMachinesChange}/>
            )}

            {machines.length > 0 && (
                <div>
                    <p className="text-xs text-gray-500 mb-2">
                        Machines enregistrées ({machines.length}/{machineLock ? maxMachines : '∞'})
                    </p>
                    <div className="flex flex-col gap-1">
                        {machines.map((m) => (
                            <MachineItem key={m.id} machine={m} removePending={removePending} onRemove={onRemoveMachine}/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function MachineLockToggle({enabled, onToggle}: { enabled: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Machine Lock</p>
            <button
                onClick={onToggle}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`}/>
            </button>
        </div>
    );
}

function MaxMachinesInput({value, onChange}: { value: number; onChange: (n: number) => void }) {
    return (
        <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">PCs autorisés</p>
            <input
                type="number"
                min={1}
                value={value}
                onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-24 focus:outline-none focus:border-indigo-500"
            />
        </div>
    );
}

function MachineItem({machine, removePending, onRemove}: {
    machine: LicenseMachine;
    removePending: boolean;
    onRemove: (machineId: string) => void;
}) {
    return (
        <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded px-3 py-2">
            <div>
                <span className="text-xs font-mono text-gray-300">{machine.machineId}</span>
                {machine.label && <span className="ml-2 text-xs text-gray-500">"{machine.label}"</span>}
                {machine.lastSeenAt && (
                    <span className="ml-2 text-xs text-gray-600">
                        · vu {new Date(machine.lastSeenAt).toLocaleDateString('fr-FR')}
                    </span>
                )}
            </div>
            <button
                onClick={() => onRemove(machine.machineId)}
                disabled={removePending}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
            >
                ✕
            </button>
        </div>
    );
}
