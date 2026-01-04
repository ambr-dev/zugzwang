### notes from 2025/09/15

- [x] rewrite FEN input to match new array index structure
- [x] look at structure of offsets? maybe have [x, y] instead of [y, x]
- [x] fix & test pawn pseudo moves generation (black pawns were troublesome (holy that sounds racist af))
- [x] test a8 pawn pseudo moves (pseudo moves wouldn't be calced in some tests)
- [x] continue pseudo move generation
- [x] castling pseudo moves (Q + K side)
- [x] en croissant pseudo move
- [x] i think somewhere in the code there is a raycast bug with !!index in a while head.
- [ ] enhance the config with an en passant field and diverge to normal en passant if not present
- [ ] enhance the config with a castling object and diverge to normal castling if not present