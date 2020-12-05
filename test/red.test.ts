import red, { setDebugLevel } from "../src/red"

setDebugLevel(0);
test("init", () => {
  red.init(['index', 'index/tab1', 'index/tab2', 'index/tab3', 'index/tab1/btn'])
  // red.map
  // {
  //   'index': 0,
  //   'index/tab1': 0,
  //   'index/tab1/btn': 0,
  //   'index/tab2': 0,
  //   'index/tab3': 0,
  // }
  expect(red.get('index')).toBe(0)
  expect(red.get('index/tab1')).toBe(0)
  expect(red.get('index/tab1/btn')).toBe(0)
  expect(red.get('index/tab2')).toBe(0)
  expect(red.get('index/tab3')).toBe(0)
})

describe('set', () => {

  test('set', () => {
    red.set('index/tab1/btn', 1)
    expect(red.get('index')).toBe(1)
    expect(red.get('index/tab1')).toBe(1)
    expect(red.get('index/tab1/btn')).toBe(1)

    red.set('index/tab2', 10)
    // same-value test
    red.set('index/tab2', 10)
    expect(red.get('index')).toBe(11)
    expect(red.get('index/tab2')).toBe(10)
  })

  test('set boolean-conversion', () => {
    red.set('index/tab3', true)
    expect(red.get('index/tab3')).toBe(1)
  })

  test('set empty', () => {
    red.set('', 1)
  })

  test('set-force', () => {
    red.set('index/tab3/f1', 1, {
      force: true
    })
    red.set('index/tab3/f2', 2, {
      force: true
    })
    red.set('index/tab3/f3', 3, {
      force: true
    })
    expect(red.get('index/tab3/f1')).toBe(1)
    expect(red.get('index/tab3/f2')).toBe(2)
    expect(red.get('index/tab3/f3')).toBe(3)
    expect(red.get('index/tab3')).toBe(6)
    expect(red.get('index')).toBe(17)
  })

  test('set empty-force', () => {
    red.set('', 1, {
      force: true
    })
  })

  test('set across-empty', () => {
    // index/tab4 is not be added in tree
    red.set('index/tab4/new', 1, {
      force: true
    })
    expect(red.get('index/tab4')).toBe(1)
    expect(red.get('index/tab4/new')).toBe(1)
    expect(red.get('index')).toBe(18)
  })

})

describe('del', () => {
  
  test('del - init', () => {
    // can't
    red.set('index/tab3', 1)
    const ret = red.del('index/tab3')
    expect(ret).toBe(false)
    expect(red.get('index/tab3')).not.toBe(0)
  })

  test('del - dynamic', () => {
    // can
    red.set('index/tab3/f4', 1, { force: true })
    const ret = red.del('index/tab3/f4')
    expect(ret).toBe(true)
    expect(red.get('index/tab3/f4')).toBe(0)
  })

  test('del - undefined', () => {
    const ret = red.del('giao/skr')
    expect(ret).toBe(false)
  })

  test('del - have listener', () => {
    red.set('custom/dynamic/temp', true, { force: true })
    let custom = red.get('custom')
    expect(custom).toBe(1);
    let receiveTime = 0
    function fn(num: number) {
      console.log(num)
      receiveTime++;
    }
    const key_temp = red.on('custom/dynamic/temp', fn)
    const key_dynamic = red.on('custom/dynamic', fn)
    const key_custom = red.on('custom', fn)
    red.set('custom/dynamic/temp', 2)
    expect(receiveTime).toBe(3);
    const ret = red.del('custom')
    expect(ret).toBe(true)
    red.off('custom/dynamic/temp', key_temp)
    red.off('custom/dynamic', key_dynamic)
    red.off('custom', key_custom)
    expect(red.get('custom/dynamic/temp')).toBe(0)
    expect(red.get('custom/dynamic')).toBe(0)
    expect(red.get('custom')).toBe(0)
    red.set('custom/dynamic/temp', 1)
    expect(receiveTime).toBe(3);
  })

})

describe('get', () => {
  test('get - have', () => {
    const ret = red.get('index')
    expect(ret).not.toBe(0)
  })
  test('get - haven\'t', () => {
    const ret = red.get('index/giao')
    expect(ret).toBe(0)
  })
})

describe('fix', () => {
  test('fix', () => {
    const isFixed = red.fixToggle('index/tab1')
    expect(isFixed).toBe(true)
  })
  test('fix block', () => {
    let oldIndex = red.get('index')
    let oldTab1 = red.get('index/tab1')
    let oldBtn = red.get('index/tab1/btn')
    let newBtn = 100
    red.set('index/tab1/btn', newBtn)
    let newIndex = red.get('index')
    let newTab1 = red.get('index/tab1')
    expect(oldIndex).toBe(newIndex)
    expect(oldTab1).toBe(newTab1)
    expect(red.get('index/tab1/btn')).toBe(newBtn)
    expect(oldBtn).not.toBe(newBtn)
  })
  test('unFix', () => {
    const isFixed = red.fixToggle('index/tab1')
    expect(isFixed).toBe(false)
  })
  test('fix unblock', () => {
    let oldTab1 = red.get('index/tab1')
    let oldBtn = red.get('index/tab1/btn')
    let newBtn = 1
    red.set('index/tab1/btn', newBtn)
    let newTab1 = red.get('index/tab1')
    expect(newTab1 - oldTab1).toBe(newBtn - oldBtn)
  })
})

describe('observer', () => {
  let key: string, receiveTime = 0, arr: number[] = []
  let fn = (num: number) => {
    receiveTime++
    arr.push(num)
  }

  test('on', () => {
    let oldIndex = red.get('index')
    key = red.on('index', fn)
    let oldTab2 = red.get('index/tab2'), newTab2 = 100
    let oldBtn = red.get('index/tab1/btn'), newBtn = 20
    red.set('index/tab2', newTab2)
    red.set('index/tab1/btn', newBtn)
    expect(receiveTime).toBe(2)
    expect(arr).toEqual([
      oldIndex + (newTab2 - oldTab2), 
      oldIndex + (newTab2 - oldTab2) + (newBtn - oldBtn),
    ])
  })

  test('on - failed', () => {
    // this case will happend in ts
    let errParam:any = 'giao'
    expect(red.on('index', errParam)).toBe('')

  })

  test('off', () => {
    red.off('index', key)
    red.set('index/tab2', 0)
    expect(receiveTime).toBe(2)
  })
})

describe('test', () => {
  test('dump', () => {
    red.dump()
  })
})