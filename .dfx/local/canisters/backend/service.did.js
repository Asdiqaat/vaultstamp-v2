export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'checkFileExists' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getFiles' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'hash' : IDL.Text,
              'name' : IDL.Text,
              'size' : IDL.Nat,
              'fileType' : IDL.Text,
              'timestamp' : IDL.Int,
            })
          ),
        ],
        [],
      ),
    'uploadFile' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text], [], []),
    'verifyFileByHash' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'owner' : IDL.Principal,
              'name' : IDL.Text,
              'fileType' : IDL.Text,
              'timestamp' : IDL.Int,
            })
          ),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
