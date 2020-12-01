import Red from "../src/red";

const red = Red.getInstance()

test("init", () => {
  red.init(['index', 'index/tab1', 'index/tab2', 'index/tab3', 'index/tab1/btn'])
  expect(red.map).toEqual({
    'index': 0,
    'index/tab1': 0,
    'index/tab1/btn': 0,
    'index/tab2': 0,
    'index/tab3': 0,
  })
})

describe('set', () => {

  test('set', () => {
    red.set('index/tab1/btn', 1)
    expect(red.map).toEqual({
      'index': 1,
      'index/tab1': 1,
      'index/tab1/btn': 1,
      'index/tab2': 0,
      'index/tab3': 0,
    })

    red.set('index/tab2', 10)
    // same-value test
    red.set('index/tab2', 10)
    expect(red.map).toEqual({
      'index': 11,
      'index/tab1': 1,
      'index/tab1/btn': 1,
      'index/tab2': 10,
      'index/tab3': 0,
    })
  })

  test('set boolean-conversion', () => {
    red.set('index/tab3', true)
    expect(red.get('index/tab3')).toBe(1)
  })

  test('set empty', () => {
    let oldMap = JSON.parse(JSON.stringify(red.map))
    red.set('', 1)
    expect(red.map).toEqual(oldMap)
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
    expect(red.map).toEqual({
      'index': 17,
      'index/tab1': 1,
      'index/tab1/btn': 1,
      'index/tab2': 10,
      'index/tab3': 6,
      'index/tab3/f1': 1,
      'index/tab3/f2': 2,
      'index/tab3/f3': 3,
    })
  })

  test('set empty-force', () => {
    red.set('', 1, {
      force: true
    })
    expect(red.map).toEqual({
      'index': 17,
      'index/tab1': 1,
      'index/tab1/btn': 1,
      'index/tab2': 10,
      'index/tab3': 6,
      'index/tab3/f1': 1,
      'index/tab3/f2': 2,
      'index/tab3/f3': 3,
    })
  })

  test('set across-empty', () => {
    red.set('index/tab4/new', 1, {
      force: true
    })
    expect(red.map).toEqual({
      'index': 18,
      'index/tab1': 1,
      'index/tab1/btn': 1,
      'index/tab2': 10,
      'index/tab3': 6,
      'index/tab3/f1': 1,
      'index/tab3/f2': 2,
      'index/tab3/f3': 3,
      'index/tab4': 1,
      'index/tab4/new': 1
    })
  })

})

describe('del', () => {
  
  test('del - init', () => {
    // can't
    const ret = red.del('index')
    expect(ret).toBe(false)
    expect(red.get('index')).not.toBe(0)
  })

  test('del - dynamic', () => {
    // can
    const ret = red.del('index/tab3/f3')
    expect(ret).toBe(true)
    expect(red.get('index/tab3/f3')).toBe(0)
  })

  test('del - undefined', () => {
    const ret = red.del('giao/skr')
    expect(ret).toBe(false)
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
