export function sleep(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}
