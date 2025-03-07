import React from 'react'
import { Provider, useAtom } from 'jotai/react'
import { atom } from 'jotai/vanilla'
import { atomWithActor } from 'jotai-xstate'
import { assign, createMachine } from 'xstate'

const createEditableMachine = (value: string) =>
  createMachine<{ value: string }>({
    id: 'editable',
    initial: 'reading',
    context: {
      value,
    },
    states: {
      reading: {
        on: {
          dblclick: 'editing',
        },
      },
      editing: {
        on: {
          cancel: 'reading',
          commit: {
            target: 'reading',
            actions: assign({
              value: ({ event }) => event.value,
            }),
          },
        },
      },
    },
  })

const defaultTextAtom = atom('edit me')
const editableMachineAtom = atomWithActor((get) =>
  createEditableMachine(get(defaultTextAtom))
)

const Toggle = () => {
  const [{ state }, send] = useAtom(editableMachineAtom)

  return (
    <div>
      {state.matches('reading') && (
        <strong onDoubleClick={send}>{state.context.value}</strong>
      )}
      {state.matches('editing') && (
        <input
          autoFocus
          defaultValue={state.context.value}
          onBlur={(e) => send({ type: 'commit', value: e.currentTarget.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              send({ type: 'commit', value: e.currentTarget.value })
            }
            if (e.key === 'Escape') {
              send({ type: 'cancel' })
            }
          }}
        />
      )}
      <br />
      <br />
      <div>
        Double-click to edit. Blur the input or press <code>enter</code> to
        commit. Press <code>esc</code> to cancel.
      </div>
    </div>
  )
}

const App = () => (
  <Provider>
    <Toggle />
  </Provider>
)

export default App
