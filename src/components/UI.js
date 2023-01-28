import { useEffect, useState } from 'react';

function UI(props) {

  const [gameState, setGameState] = useState('menu');

  useEffect(() => {
    setGameState(props.gameState);
  }, [props.gameState]);

  return (
    <>
      { (gameState === 'menu' || gameState === 'victory') ?
        <div className='UI'>
          { gameState === 'victory' ? <h1>Victory</h1> : <h1>Pick Difficulty</h1> }
          <div className='difficulty-select'>
            <button onClick={ () => { props.changeGameDifficulty(3) } }>3x3x3</button>
            <button onClick={ () => { props.changeGameDifficulty(4) } }>4x4x4</button>
            <button onClick={ () => { props.changeGameDifficulty(5) } }>5x5x5</button>
          </div>
        </div>
        : <></>
      }
    </>
  );
}

export default UI;